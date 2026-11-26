const { z } = require('zod');

const APPLICATION_STATUSES = [
  'Wishlist',
  'Applied',
  'Assessment',
  'Interview',
  'Offer Received',
  'Rejected',
];

const JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const INTERVIEW_TYPES = [
  'Online assessment',
  'Aptitude test',
  'Technical interview',
  'Coding round',
  'HR interview',
  'Final interview',
];

const INTERVIEW_STATUSES = ['Upcoming', 'Completed', 'Passed', 'Failed', 'Cancelled'];

const optionalString = z.string().trim().optional().or(z.literal('')).transform((v) => (v === '' ? null : v));
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || /^https?:\/\/.+/i.test(v), 'Must be a valid http/https URL')
  .transform((v) => (v === '' ? null : v));
const optionalEmail = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email address')
  .transform((v) => (v === '' ? null : v));
const optionalDate = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((v) => {
    if (!v || v === '') return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
    email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
  emailRemindersEnabled: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
});

const applicationCreateSchema = z.object({
  companyName: z.string().trim().min(1, 'Company name is required').max(120),
  jobTitle: z.string().trim().min(1, 'Job title is required').max(120),
  jobType: z.enum(JOB_TYPES).default('Internship'),
  workMode: z.enum(WORK_MODES).default('On-site'),
  location: optionalString,
  compensation: optionalString,
  applicationUrl: optionalUrl,
  applicationDate: optionalDate,
  deadline: optionalDate,
  status: z.enum(APPLICATION_STATUSES).default('Wishlist'),
  priority: z.enum(PRIORITIES).default('Medium'),
  recruiterName: optionalString,
  recruiterEmail: optionalEmail,
  description: optionalString,
  notes: optionalString,
});

const applicationUpdateSchema = applicationCreateSchema.partial();

const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});

const interviewCreateSchema = z.object({
  roundName: z.string().trim().min(1, 'Round name is required').max(100),
  interviewType: z.enum(INTERVIEW_TYPES),
  scheduledAt: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), 'Valid date and time is required'),
  meetingLink: optionalUrl,
  location: optionalString,
  interviewerDetails: optionalString,
  status: z.enum(INTERVIEW_STATUSES).default('Upcoming'),
  preparationNotes: optionalString,
  feedback: optionalString,
});

const interviewUpdateSchema = interviewCreateSchema.partial();

const reminderCreateSchema = z.object({
  applicationId: z.string().min(1, 'Application is required'),
  interviewRoundId: z.string().optional().nullable(),
  reminderType: z.enum(['DEADLINE_24H', 'INTERVIEW_24H', 'CUSTOM']).default('CUSTOM'),
  title: optionalString,
  scheduledAt: z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), 'Valid reminder date and time is required'),
});

const reminderUpdateSchema = z.object({
  title: optionalString,
  scheduledAt: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Valid date and time is required')
    .optional(),
  deliveryStatus: z.enum(['PENDING', 'SENT', 'PREVIEWED', 'FAILED', 'SKIPPED']).optional(),
});

module.exports = {
  APPLICATION_STATUSES,
  JOB_TYPES,
  WORK_MODES,
  PRIORITIES,
  INTERVIEW_TYPES,
  INTERVIEW_STATUSES,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  applicationCreateSchema,
  applicationUpdateSchema,
  applicationStatusSchema,
  interviewCreateSchema,
  interviewUpdateSchema,
  reminderCreateSchema,
  reminderUpdateSchema,
};
