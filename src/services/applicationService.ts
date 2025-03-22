import prisma from "../config/prisma";

export const saveApplication = async (userId: number, jobId: number) => {
  try {
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
  } catch (error) {
    console.log("Error saving new application:", error);
    throw new Error(
      error instanceof Error ? error.message : "Error saving new application."
    );
  }
};

export const getApplications = async () => {
  try {
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
  } catch (error) {
    console.log("Error getting applications:", error);
    throw new Error(
      error instanceof Error ? error.message : "Error getting applications."
    );
  }
};

export const getApplicationById = async (id: number) => {
  try {
    const application = await prisma.application.findFirst({
      where: {
        id: id,
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
  } catch (error) {
    console.log(`Error getting application of ID ${id}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error getting application of ID ${id}.`
    );
  }
};

export const getApplicationsByUserId = async (userId: number) => {
  try {
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
  } catch (error) {
    console.log(`Error getting applications for user ID ${userId}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error getting applications for user ID ${userId}.`
    );
  }
};

export const deleteApplicationById = async (
  userId: number,
  applicationId: number
) => {
  try {
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
  } catch (error) {
    console.log(`Error deleting application of ID ${applicationId}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error deleting application of ID ${applicationId}.`
    );
  }
};
