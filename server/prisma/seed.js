const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping demo seed in production environment.');
    return;
  }

  console.log('Seeding PlaceTrack development database...');

  const demoEmail = 'demo@placetrack.local';
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: { name: 'Aarav Sharma', passwordHash },
    create: {
      name: 'Aarav Sharma',
      email: demoEmail,
      passwordHash,
      emailRemindersEnabled: true,
    },
  });

  // Clear existing demo user applications to keep seed idempotent
  await prisma.application.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const sampleApps = [
    {
      companyName: 'Stripe',
      jobTitle: 'Software Engineer Intern',
      jobType: 'Internship',
      workMode: 'Hybrid',
      location: 'Bengaluru, India',
      compensation: '₹80,000 / month',
      applicationUrl: 'https://stripe.com/jobs',
      applicationDate: daysAgo(18),
      deadline: daysFromNow(3),
      status: 'Interview',
      priority: 'High',
      recruiterName: 'Priya Nair',
      recruiterEmail: 'priya.nair@example.com',
      description: 'Backend & payments infrastructure internship working with distributed APIs.',
      notes: 'Focus on REST API design, idempotency, and SQL indexing.',
      interviews: [
        {
          roundName: 'Online Coding Assessment',
          interviewType: 'Online assessment',
          scheduledAt: daysAgo(12),
          location: 'HackerRank',
          status: 'Passed',
          preparationNotes: 'Practiced string parsing and rate limiter problems.',
          feedback: 'Solved both questions with optimal time complexity.',
        },
        {
          roundName: 'Technical Round 1 — API & Debugging',
          interviewType: 'Technical interview',
          scheduledAt: daysFromNow(1),
          meetingLink: 'https://meet.google.com/abc-defg-hij',
          location: 'Google Meet',
          interviewerDetails: 'Rahul Verma, Staff Engineer',
          status: 'Upcoming',
          preparationNotes: 'Review HTTP status codes, pagination, and clean code structure.',
        },
      ],
    },
    {
      companyName: 'Atlassian',
      jobTitle: 'Full-Stack Developer Intern',
      jobType: 'Internship',
      workMode: 'Remote',
      location: 'Remote (India)',
      compensation: '₹75,000 / month',
      applicationUrl: 'https://atlassian.com/company/careers',
      applicationDate: daysAgo(25),
      deadline: daysFromNow(5),
      status: 'Offer Received',
      priority: 'High',
      recruiterName: 'Sneha Kulkarni',
      recruiterEmail: 'sneha.k@example.com',
      description: 'Building collaborative React + Node.js features for Jira Cloud.',
      notes: 'Received verbal offer; reviewing offer letter details.',
      interviews: [
        {
          roundName: 'Coding & Data Structures',
          interviewType: 'Coding round',
          scheduledAt: daysAgo(16),
          status: 'Passed',
          feedback: 'Strong problem solving and clean modular code.',
        },
        {
          roundName: 'Values & HR Interview',
          interviewType: 'HR interview',
          scheduledAt: daysAgo(8),
          status: 'Passed',
          feedback: 'Great culture fit and communication.',
        },
      ],
    },
    {
      companyName: 'Razorpay',
      jobTitle: 'Frontend Engineer Intern',
      jobType: 'Internship',
      workMode: 'On-site',
      location: 'Bengaluru, India',
      compensation: '₹50,000 / month',
      applicationUrl: 'https://razorpay.com/jobs',
      applicationDate: daysAgo(10),
      deadline: daysFromNow(2),
      status: 'Assessment',
      priority: 'High',
      recruiterName: 'Karan Mehta',
      recruiterEmail: 'karan.m@example.com',
      description: 'Work on merchant checkout dashboard using React and Tailwind CSS.',
      notes: 'Revise React hooks, debouncing, and accessibility.',
      interviews: [
        {
          roundName: 'Frontend Machine Coding',
          interviewType: 'Online assessment',
          scheduledAt: daysFromNow(2),
          meetingLink: 'https://zoom.us/j/123456789',
          location: 'Zoom',
          status: 'Upcoming',
          preparationNotes: 'Build a filterable table without external UI libraries.',
        },
      ],
    },
    {
      companyName: 'Vercel',
      jobTitle: 'Junior Solutions Engineer',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      compensation: '$85,000 / year',
      applicationUrl: 'https://vercel.com/careers',
      applicationDate: daysAgo(7),
      deadline: daysFromNow(10),
      status: 'Applied',
      priority: 'Medium',
      description: 'Help developers deploy and optimize modern web applications.',
      notes: 'Submitted portfolio with PlaceTrack project link.',
    },
    {
      companyName: 'Swiggy',
      jobTitle: 'SDE Intern (Backend)',
      jobType: 'Internship',
      workMode: 'Hybrid',
      location: 'Bengaluru, India',
      compensation: '₹45,000 / month',
      applicationDate: daysAgo(45),
      status: 'Rejected',
      priority: 'Medium',
      description: 'Order tracking microservices and PostgreSQL optimization.',
      notes: 'Missed edge case in graph shortest-path question.',
      interviews: [
        {
          roundName: 'DSA Screening',
          interviewType: 'Aptitude test',
          scheduledAt: daysAgo(38),
          status: 'Failed',
          feedback: 'Need faster debugging under time pressure.',
        },
      ],
    },
    {
      companyName: 'Postman',
      jobTitle: 'API Platform Intern',
      jobType: 'Internship',
      workMode: 'Hybrid',
      location: 'Bengaluru, India',
      compensation: '₹60,000 / month',
      applicationDate: daysAgo(4),
      deadline: daysFromNow(1),
      status: 'Applied',
      priority: 'High',
      description: 'Work on API testing tools and developer workflows.',
      notes: 'Deadline is tomorrow — double-check resume attachment.',
    },
    {
      companyName: 'Linear',
      jobTitle: 'Product Engineering Intern',
      jobType: 'Internship',
      workMode: 'Remote',
      location: 'Remote',
      compensation: '$6,000 / month',
      applicationDate: daysAgo(2),
      deadline: daysFromNow(14),
      status: 'Wishlist',
      priority: 'High',
      description: 'Craft fast, keyboard-first web interfaces.',
      notes: 'Polish UI portfolio before submitting.',
    },
    {
      companyName: 'Zoho',
      jobTitle: 'Software Developer',
      jobType: 'Full-time',
      workMode: 'On-site',
      location: 'Chennai, India',
      compensation: '₹8.4 LPA',
      applicationDate: daysAgo(30),
      status: 'Interview',
      priority: 'Medium',
      recruiterName: 'Divya Krishnan',
      description: 'Full-stack product development with Java/Node and PostgreSQL.',
      interviews: [
        {
          roundName: 'Aptitude & C Programming',
          interviewType: 'Aptitude test',
          scheduledAt: daysAgo(20),
          status: 'Passed',
        },
        {
          roundName: 'Final Managerial Round',
          interviewType: 'Final interview',
          scheduledAt: daysFromNow(4),
          location: 'Chennai Campus / Zoom',
          status: 'Upcoming',
          preparationNotes: 'Prepare walkthrough of PlaceTrack architecture.',
        },
      ],
    },
    {
      companyName: 'Freshworks',
      jobTitle: 'Associate Software Engineer',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Chennai, India',
      compensation: '₹10 LPA',
      applicationDate: daysAgo(15),
      deadline: daysFromNow(7),
      status: 'Applied',
      priority: 'Medium',
      description: 'SaaS CRM platform engineering.',
    },
    {
      companyName: 'Cred',
      jobTitle: 'Backend Engineering Intern',
      jobType: 'Internship',
      workMode: 'On-site',
      location: 'Bengaluru, India',
      compensation: '₹70,000 / month',
      applicationDate: daysAgo(55),
      status: 'Rejected',
      priority: 'Low',
      description: 'High-throughput fintech backend systems.',
    },
    {
      companyName: 'Notion',
      jobTitle: 'Frontend Intern',
      jobType: 'Internship',
      workMode: 'Remote',
      location: 'Remote',
      compensation: '$5,500 / month',
      applicationDate: daysAgo(1),
      deadline: daysFromNow(20),
      status: 'Wishlist',
      priority: 'Medium',
      description: 'Rich text editor & collaborative workspace UI.',
    },
    {
      companyName: 'BrowserStack',
      jobTitle: 'Part-Time QA Automation Intern',
      jobType: 'Part-time',
      workMode: 'Remote',
      location: 'Remote (India)',
      compensation: '₹30,000 / month',
      applicationDate: daysAgo(6),
      deadline: daysFromNow(6),
      status: 'Assessment',
      priority: 'Low',
      description: 'Automated browser testing infrastructure.',
    },
  ];

  const createdApps = [];
  for (const item of sampleApps) {
    const { interviews, ...appData } = item;
    const created = await prisma.application.create({
      data: {
        ...appData,
        userId: user.id,
        interviews: interviews ? { create: interviews } : undefined,
      },
      include: { interviews: true },
    });
    createdApps.push(created);
  }

  // Create example reminders
  const stripeApp = createdApps.find((a) => a.companyName === 'Stripe');
  const postmanApp = createdApps.find((a) => a.companyName === 'Postman');
  const linearApp = createdApps.find((a) => a.companyName === 'Linear');

  if (stripeApp && stripeApp.interviews[1]) {
    await prisma.reminder.create({
      data: {
        userId: user.id,
        applicationId: stripeApp.id,
        interviewRoundId: stripeApp.interviews[1].id,
        reminderType: 'CUSTOM',
        title: 'Revise Stripe API idempotency notes before Technical Round 1',
        scheduledAt: daysFromNow(1),
        deliveryStatus: 'PENDING',
      },
    });
  }

  if (postmanApp) {
    await prisma.reminder.create({
      data: {
        userId: user.id,
        applicationId: postmanApp.id,
        reminderType: 'DEADLINE_24H',
        title: 'Postman API Platform Intern deadline approaching',
        scheduledAt: daysFromNow(0),
        deliveryStatus: 'PREVIEWED',
        sentAt: now,
      },
    });
  }

  if (linearApp) {
    await prisma.reminder.create({
      data: {
        userId: user.id,
        applicationId: linearApp.id,
        reminderType: 'CUSTOM',
        title: 'Submit Linear application after polishing portfolio',
        scheduledAt: daysFromNow(3),
        deliveryStatus: 'PENDING',
      },
    });
  }

  console.log(`Seeded ${createdApps.length} applications for demo user (${demoEmail}).`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
