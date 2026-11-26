const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { interviewCreateSchema, interviewUpdateSchema } = require('../validators/schemas');

const getApplicationInterviews = asyncHandler(async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
  });

  if (!application || application.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  const interviews = await prisma.interviewRound.findMany({
    where: { applicationId: req.params.id },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json({ success: true, data: interviews });
});

const getAllUserInterviews = asyncHandler(async (req, res) => {
  const interviews = await prisma.interviewRound.findMany({
    where: {
      application: { userId: req.user.id },
    },
    include: {
      application: {
        select: {
          id: true,
          companyName: true,
          jobTitle: true,
          status: true,
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json({ success: true, data: interviews });
});

const createInterview = asyncHandler(async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
  });

  if (!application || application.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  const data = interviewCreateSchema.parse(req.body);

  const interview = await prisma.interviewRound.create({
    data: {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      applicationId: req.params.id,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Interview round added.',
    data: interview,
  });
});

const updateInterview = asyncHandler(async (req, res) => {
  const existing = await prisma.interviewRound.findUnique({
    where: { id: req.params.id },
    include: { application: true },
  });

  if (!existing || existing.application.userId !== req.user.id) {
    throw new AppError('Interview round not found.', 404);
  }

  const data = interviewUpdateSchema.parse(req.body);

  const updated = await prisma.interviewRound.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(data.scheduledAt ? { scheduledAt: new Date(data.scheduledAt) } : {}),
    },
  });

  res.json({
    success: true,
    message: 'Interview round updated.',
    data: updated,
  });
});

const deleteInterview = asyncHandler(async (req, res) => {
  const existing = await prisma.interviewRound.findUnique({
    where: { id: req.params.id },
    include: { application: true },
  });

  if (!existing || existing.application.userId !== req.user.id) {
    throw new AppError('Interview round not found.', 404);
  }

  await prisma.interviewRound.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Interview round deleted.',
  });
});

module.exports = {
  getApplicationInterviews,
  getAllUserInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
};
