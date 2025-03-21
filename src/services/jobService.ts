import prisma from "../config/prisma";

interface JobData {
  title: string;
  company_name: string;
  company_url: string;
  location: string;
  url: string;
  list_date: string;
}

export const saveJobs = async (jobs: JobData[]) => {
  const savedJobs = [];

  for (const job of jobs) {
    const existingJob = await prisma.job.findFirst({
      where: { description: job.url },
    });

    if (!existingJob) {
      const newJob = await prisma.job.create({
        data: {
          title: job.title,
          company: job.company_name,
          companyURL: job.company_url,
          location: job.location,
          description: job.url,
          postedAt: new Date(job.list_date),
        },
      });

      savedJobs.push(newJob);
    }
  }

  return savedJobs;
};

export const getJobs = async () => {
  const jobs = await prisma.job.findMany();

  return jobs;
};

export const getJobById = async (id: number) => {
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  return job;
};

export const deleteJobById = async (id: number) => {
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  await prisma.job.delete({ where: { id } });
};

export const updateJobById = async (
  id: number,
  updateData: Partial<{
    title: string;
    company: string;
    companyURL: string;
    location: string;
    description: string;
    postedAt: Date;
  }>
) => {
  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    throw new Error("Job not found.");
  }

  return await prisma.job.update({
    where: { id },
    data: updateData,
  });
};
