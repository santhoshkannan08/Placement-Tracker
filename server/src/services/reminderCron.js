const cron = require('node-cron');
const prisma = require('../config/db');
const { sendEmail } = require('./emailService');

let cronTask = null;

/**
 * Process due reminders and auto-generate 24h deadline / interview reminders
 * without creating duplicates.
 */
async function processReminders() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  try {
    // 1. Auto-create DEADLINE_24H reminders for applications with deadlines in the next 24h
    const upcomingDeadlines = await prisma.application.findMany({
      where: {
        deadline: { gte: now, lte: in24Hours },
        status: { notIn: ['Rejected', 'Offer Received'] },
        user: { emailRemindersEnabled: true },
      },
      include: { user: true },
    });

    for (const app of upcomingDeadlines) {
      const existing = await prisma.reminder.findFirst({
        where: {
          applicationId: app.id,
          reminderType: 'DEADLINE_24H',
        },
      });

      if (!existing) {
        await prisma.reminder.create({
          data: {
            userId: app.userId,
            applicationId: app.id,
            reminderType: 'DEADLINE_24H',
            title: `Deadline approaching: ${app.companyName} - ${app.jobTitle}`,
            scheduledAt: now,
            deliveryStatus: 'PENDING',
          },
        });
      }
    }

    // 2. Auto-create INTERVIEW_24H reminders for upcoming interviews in the next 24h
    const upcomingInterviews = await prisma.interviewRound.findMany({
      where: {
        scheduledAt: { gte: now, lte: in24Hours },
        status: 'Upcoming',
        application: {
          user: { emailRemindersEnabled: true },
        },
      },
      include: {
        application: {
          include: { user: true },
        },
      },
    });

    for (const interview of upcomingInterviews) {
      const existing = await prisma.reminder.findFirst({
        where: {
          interviewRoundId: interview.id,
          reminderType: 'INTERVIEW_24H',
        },
      });

      if (!existing) {
        await prisma.reminder.create({
          data: {
            userId: interview.application.userId,
            applicationId: interview.applicationId,
            interviewRoundId: interview.id,
            reminderType: 'INTERVIEW_24H',
            title: `Upcoming interview: ${interview.roundName} at ${interview.application.companyName}`,
            scheduledAt: now,
            deliveryStatus: 'PENDING',
          },
        });
      }
    }

    // 3. Deliver all PENDING reminders that are due (scheduledAt <= now)
    const dueReminders = await prisma.reminder.findMany({
      where: {
        deliveryStatus: 'PENDING',
        scheduledAt: { lte: now },
      },
      include: {
        user: true,
        application: true,
        interviewRound: true,
      },
    });

    for (const reminder of dueReminders) {
      if (!reminder.user.emailRemindersEnabled) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { deliveryStatus: 'SKIPPED' },
        });
        continue;
      }

      const subject =
        reminder.title ||
        `PlaceTrack Reminder: ${reminder.application.companyName} (${reminder.application.jobTitle})`;

      const textBody = [
        `Hi ${reminder.user.name},`,
        '',
        `This is a reminder from PlaceTrack regarding your application at ${reminder.application.companyName} for ${reminder.application.jobTitle}.`,
        reminder.interviewRound
          ? `Interview: ${reminder.interviewRound.roundName} (${reminder.interviewRound.interviewType}) on ${new Date(reminder.interviewRound.scheduledAt).toLocaleString()}`
          : reminder.application.deadline
            ? `Application Deadline: ${new Date(reminder.application.deadline).toLocaleString()}`
            : '',
        '',
        'Best of luck with your placement journey!',
        '- PlaceTrack',
      ]
        .filter(Boolean)
        .join('\n');

      const htmlBody = `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h2 style="color: #4f46e5; margin-top: 0;">PlaceTrack Reminder</h2>
          <p>Hi <strong>${reminder.user.name}</strong>,</p>
          <p>This is a reminder for your application at <strong>${reminder.application.companyName}</strong> — <em>${reminder.application.jobTitle}</em>.</p>
          ${
            reminder.interviewRound
              ? `<p><strong>Interview:</strong> ${reminder.interviewRound.roundName} (${reminder.interviewRound.interviewType})<br/><strong>Scheduled:</strong> ${new Date(reminder.interviewRound.scheduledAt).toLocaleString()}</p>`
              : reminder.application.deadline
                ? `<p><strong>Application Deadline:</strong> ${new Date(reminder.application.deadline).toLocaleString()}</p>`
                : ''
          }
          <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">You can manage your reminder preferences in PlaceTrack Settings.</p>
        </div>
      `;

      try {
        const result = await sendEmail({
          to: reminder.user.email,
          subject,
          text: textBody,
          html: htmlBody,
        });

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            deliveryStatus: result.status,
            sentAt: new Date(),
          },
        });
      } catch (err) {
        console.error(`Failed to send reminder ${reminder.id}:`, err.message);
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { deliveryStatus: 'FAILED' },
        });
      }
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err.message);
  }
}

function startReminderCron() {
  if (cronTask) return cronTask;
  // Run every 5 minutes
  cronTask = cron.schedule('*/5 * * * *', () => {
    processReminders();
  });
  console.log('Reminder cron job scheduled (every 5 minutes).');
  return cronTask;
}

module.exports = { startReminderCron, processReminders };
