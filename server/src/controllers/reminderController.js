const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { reminderCreateSchema, reminderUpdateSchema } = require('../validators/schemas');
const { sendEmail } = require('../services/emailService');
const { processReminders } = require('../services/reminderCron');

const getReminders = asyncHandler(async (req, res) => {
  const reminders = await prisma.reminder.findMany({
    where: { userId: req.user.id },
    include: {
      application: {
        select: { id: true, companyName: true, jobTitle: true, deadline: true },
      },
      interviewRound: {
        select: { id: true, roundName: true, interviewType: true, scheduledAt: true },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json({ success: true, data: reminders });
});

const createReminder = asyncHandler(async (req, res) => {
  const data = reminderCreateSchema.parse(req.body);

  const application = await prisma.application.findUnique({
    where: { id: data.applicationId },
  });

  if (!application || application.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  if (data.interviewRoundId) {
    const round = await prisma.interviewRound.findUnique({
      where: { id: data.interviewRoundId },
    });
    if (!round || round.applicationId !== application.id) {
      throw new AppError('Interview round not found for this application.', 404);
    }
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId: req.user.id,
      applicationId: data.applicationId,
      interviewRoundId: data.interviewRoundId || null,
      reminderType: data.reminderType,
      title: data.title || `Reminder: ${application.companyName} - ${application.jobTitle}`,
      scheduledAt: new Date(data.scheduledAt),
      deliveryStatus: 'PENDING',
    },
    include: {
      application: {
        select: { id: true, companyName: true, jobTitle: true },
      },
      interviewRound: {
        select: { id: true, roundName: true, scheduledAt: true },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Reminder scheduled successfully.',
    data: reminder,
  });
});

const updateReminder = asyncHandler(async (req, res) => {
  const existing = await prisma.reminder.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new AppError('Reminder not found.', 404);
  }

  const data = reminderUpdateSchema.parse(req.body);

  const updated = await prisma.reminder.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
    },
  });

  res.json({
    success: true,
    message: 'Reminder updated.',
    data: updated,
  });
});

const deleteReminder = asyncHandler(async (req, res) => {
  const existing = await prisma.reminder.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new AppError('Reminder not found.', 404);
  }

  await prisma.reminder.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Reminder deleted.',
  });
});

const sendTestEmail = asyncHandler(async (req, res) => {
  // Restricted strictly to the authenticated user's own email address
  const result = await sendEmail({
    to: req.user.email,
    subject: 'PlaceTrack — Test Reminder Email',
    text: `Hi ${req.user.name},\n\nThis is a test reminder email from PlaceTrack. Your email notification settings are working!\n\n- PlaceTrack`,
    html: `<div style="font-family: Inter, Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;"><h3 style="color:#4f46e5;margin-top:0;">PlaceTrack Test Email</h3><p>Hi <strong>${req.user.name}</strong>,</p><p>Your PlaceTrack reminder system is configured and working properly.</p></div>`,
  });

  // Also trigger due reminder processing so user can test immediately
  await processReminders();

  res.json({
    success: true,
    message:
      result.status === 'PREVIEWED'
        ? `Dev mode active: test email previewed for ${req.user.email} (check server console).`
        : `Test email sent to ${req.user.email}.`,
    deliveryStatus: result.status,
  });
});

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  sendTestEmail,
};
