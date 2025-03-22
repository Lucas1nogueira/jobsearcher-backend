import prisma from "../config/prisma";

export const saveApplication = async (userId: number, jobId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  const existingApplication = await prisma.application.findFirst({
    where: {
      userId: userId,
      jobId: jobId,
    },
  });

  if (existingApplication) {
    throw new Error("Application already exists.");
  }

  const newApplication = await prisma.application.create({
    data: {
      userId,
      jobId,
    },
    include: {
      user: true,
      job: true,
    },
  });

  return newApplication;
};

export const getApplications = async () => {
  const applications = await prisma.application.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      job: true,
    },
  });

  return applications;
};

export const getApplicationById = async (applicationId: number) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      job: true,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  return application;
};

export const getApplicationsByUserId = async (userId: number) => {
  const applications = await prisma.application.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      job: true,
    },
  });

  return applications;
};

export const deleteApplicationById = async (
  userId: number,
  applicationId: number
) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId: userId,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  await prisma.application.delete({
    where: { id: applicationId },
  });
};
