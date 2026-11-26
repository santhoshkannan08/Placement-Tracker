const prisma = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { APPLICATION_STATUSES } = require('../validators/schemas');

const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();

  const [applications, interviews] = await Promise.all([
    prisma.application.findMany({
      where: { userId },
      orderBy: { applicationDate: 'asc' },
    }),
    prisma.interviewRound.findMany({
      where: { application: { userId } },
      include: {
        application: {
          select: { id: true, companyName: true, jobTitle: true },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    }),
  ]);

  const totalApplications = applications.length;
  const offersReceived = applications.filter((a) => a.status === 'Offer Received').length;
  const rejectedApplications = applications.filter((a) => a.status === 'Rejected').length;
  const activeApplications = applications.filter(
    (a) => !['Offer Received', 'Rejected'].includes(a.status)
  ).length;

  const upcomingInterviews = interviews.filter(
    (i) => i.status === 'Upcoming' && new Date(i.scheduledAt) >= now
  );

  const pendingDeadlines = applications.filter(
    (a) =>
      a.deadline &&
      new Date(a.deadline) >= now &&
      !['Offer Received', 'Rejected'].includes(a.status)
  );

  // Success rate: percentage of non-wishlist decided or progressed applications, or offers / total submitted
  const submittedCount = applications.filter((a) => a.status !== 'Wishlist').length;
  const successRate =
    submittedCount > 0 ? Math.round((offersReceived / submittedCount) * 100) : 0;

  // Status distribution for Donut chart
  const statusCounts = APPLICATION_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});
  for (const app of applications) {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status] += 1;
    }
  }
  const statusDistribution = Object.entries(statusCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);

  // Applications submitted per month (last 6 months + any active months)
  const monthlyMap = new Map();
  for (const app of applications) {
    const d = new Date(app.applicationDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, { key, month: label, count: 0 });
    }
    monthlyMap.get(key).count += 1;
  }
  const monthlyApplications = Array.from(monthlyMap.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );

  // Application progress funnel (cumulative progression)
  const funnel = [
    { stage: 'Applied', count: applications.filter((a) => a.status !== 'Wishlist').length },
    {
      stage: 'Assessment',
      count: applications.filter((a) =>
        ['Assessment', 'Interview', 'Offer Received'].includes(a.status)
      ).length,
    },
    {
      stage: 'Interview',
      count: applications.filter((a) => ['Interview', 'Offer Received'].includes(a.status))
        .length,
    },
    { stage: 'Offer Received', count: offersReceived },
  ];

  // Upcoming interview & deadline timeline (next 10 items)
  const timelineItems = [
    ...upcomingInterviews.map((i) => ({
      id: `int-${i.id}`,
      type: 'interview',
      title: `${i.roundName} — ${i.application.companyName}`,
      subtitle: `${i.application.jobTitle} (${i.interviewType})`,
      date: i.scheduledAt,
      applicationId: i.application.id,
    })),
    ...pendingDeadlines.map((a) => ({
      id: `dl-${a.id}`,
      type: 'deadline',
      title: `Deadline — ${a.companyName}`,
      subtitle: a.jobTitle,
      date: a.deadline,
      applicationId: a.id,
    })),
  ]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  res.json({
    success: true,
    data: {
      summary: {
        totalApplications,
        activeApplications,
        upcomingInterviews: upcomingInterviews.length,
        offersReceived,
        rejectedApplications,
        successRate,
        pendingDeadlines: pendingDeadlines.length,
      },
      statusDistribution,
      monthlyApplications,
      funnel,
      upcomingTimeline: timelineItems,
    },
  });
});

module.exports = { getDashboardStats };
