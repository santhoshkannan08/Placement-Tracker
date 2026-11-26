const prisma = require('../config/db');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const {
  applicationCreateSchema,
  applicationUpdateSchema,
  applicationStatusSchema,
} = require('../validators/schemas');

const getApplications = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    jobType,
    priority,
    workMode,
    startDate,
    endDate,
    sort = 'newest',
  } = req.query;

  const where = {
    userId: req.user.id,
  };

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { companyName: { contains: term, mode: 'insensitive' } },
      { jobTitle: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'All') where.status = status;
  if (jobType && jobType !== 'All') where.jobType = jobType;
  if (priority && priority !== 'All') where.priority = priority;
  if (workMode && workMode !== 'All') where.workMode = workMode;

  if (startDate || endDate) {
    where.applicationDate = {};
    if (startDate) where.applicationDate.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.applicationDate.lte = end;
    }
  }

  let orderBy = { applicationDate: 'desc' };
  if (sort === 'oldest') {
    orderBy = { applicationDate: 'asc' };
  } else if (sort === 'deadline') {
    orderBy = [{ deadline: 'asc' }, { applicationDate: 'desc' }];
  }

  const applications = await prisma.application.findMany({
    where,
    orderBy,
    include: {
      interviews: {
        orderBy: { scheduledAt: 'asc' },
      },
      _count: {
        select: { interviews: true, reminders: true },
      },
    },
  });

  res.json({ success: true, data: applications });
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await prisma.application.findUnique({
    where: { id: req.params.id },
    include: {
      interviews: { orderBy: { scheduledAt: 'asc' } },
      reminders: { orderBy: { scheduledAt: 'asc' } },
    },
  });

  if (!application || application.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  res.json({ success: true, data: application });
});

const createApplication = asyncHandler(async (req, res) => {
  const data = applicationCreateSchema.parse(req.body);

  const application = await prisma.application.create({
    data: {
      ...data,
      userId: req.user.id,
      applicationDate: data.applicationDate || new Date(),
    },
    include: {
      interviews: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Application created successfully.',
    data: application,
  });
});

const updateApplication = asyncHandler(async (req, res) => {
  const existing = await prisma.application.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  const data = applicationUpdateSchema.parse(req.body);

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data,
    include: {
      interviews: { orderBy: { scheduledAt: 'asc' } },
    },
  });

  res.json({
    success: true,
    message: 'Application updated successfully.',
    data: updated,
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const existing = await prisma.application.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  const { status } = applicationStatusSchema.parse(req.body);

  const updated = await prisma.application.update({
    where: { id: req.params.id },
    data: { status },
    include: {
      interviews: { orderBy: { scheduledAt: 'asc' } },
    },
  });

  res.json({
    success: true,
    message: 'Application status updated.',
    data: updated,
  });
});

const deleteApplication = asyncHandler(async (req, res) => {
  const existing = await prisma.application.findUnique({
    where: { id: req.params.id },
  });

  if (!existing || existing.userId !== req.user.id) {
    throw new AppError('Application not found.', 404);
  }

  await prisma.application.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Application deleted successfully.',
  });
});

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
};
