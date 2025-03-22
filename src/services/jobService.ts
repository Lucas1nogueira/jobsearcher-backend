import prisma from "../config/prisma";

interface JobAPIData {
  title: string;
  url: string;
  description: string;
  company_name: string;
  company_url: string;
  location: string;
  list_date: string;
}

interface JobData {
  title: string;
  url: string;
  description: string;
  company: string;
  companyURL: string;
  location: string;
}

export const saveJobs = async (jobs: JobAPIData[]) => {
  const savedJobs = [];

  for (const job of jobs) {
    const existingJob = await prisma.job.findFirst({
      where: { url: job.url },
    });

    if (!existingJob) {
      const newJob = await prisma.job.create({
        data: {
          title: job.title,
          url: job.url,
          description: "",
          company: job.company_name,
          companyURL: job.company_url,
          location: job.location,
          postedAt: new Date(job.list_date),
        },
      });

      savedJobs.push(newJob);
    }
  }

  return savedJobs;
};

export const saveJob = async (job: JobData) => {
  const newJob = await prisma.job.create({
    data: {
      title: job.title,
      url: job.url,
      description: job.description,
      company: job.company,
      companyURL: job.companyURL,
      location: job.location,
      postedAt: new Date(Date.now()),
    },
  });

  return newJob;
};

export const getJobs = async (keyword?: string, location?: string) => {
  if (keyword && !keyword.trim()) {
    throw new Error("Keyword cannot be empty.");
  }

  if (location && !location.trim()) {
    throw new Error("Location cannot be empty.");
  }

  const whereConditions: any = {};

  if (keyword) {
    whereConditions.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
      { company: { contains: keyword, mode: "insensitive" } },
    ];
  }

  if (location) {
    whereConditions.location = { contains: location, mode: "insensitive" };
  }

  const jobs = await prisma.job.findMany({
    where: whereConditions,
  });

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
  updateData: Partial<JobData>
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
