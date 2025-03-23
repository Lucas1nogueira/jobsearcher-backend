import prisma from "../config/prisma";
import * as piloterrService from "./piloterrService";

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

const fetchJobs = async (searchTerm?: string) => {
  try {
    const apiJobs: JobAPIData[] = await piloterrService.fetchJobs(searchTerm);

    const existingJobs = await prisma.job.findMany({
      where: {
        url: { in: apiJobs.map((job) => job.url) },
      },
    });

    const existingJobsUrls = existingJobs.map((job) => job.url);

    const jobsToCreate = apiJobs.filter(
      (job) => !existingJobsUrls.includes(job.url)
    );

    await prisma.job.createMany({
      data: jobsToCreate.map((job) => ({
        title: job.title,
        url: job.url,
        description: "",
        company: job.company_name,
        companyURL: job.company_url,
        location: job.location,
        postedAt: new Date(job.list_date),
      })),
    });
  } catch (error) {
    console.log("Error fetching and saving API jobs:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Error fetching and saving API jobs."
    );
  }
};

export const saveJob = async (job: JobData) => {
  try {
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
  } catch (error) {
    console.log("Error saving new job:", error);
    throw new Error(
      error instanceof Error ? error.message : "Error saving new job."
    );
  }
};

export const getJobs = async (keyword?: string, location?: string) => {
  try {
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

    if (jobs.length === 0) {
      const searchTerm = `${keyword} ${location}`;

      await fetchJobs(searchTerm);

      const newlyFetchedJobs = await prisma.job.findMany({
        where: whereConditions,
      });

      return newlyFetchedJobs;
    }

    return jobs;
  } catch (error) {
    console.log("Error getting jobs:", error);
    throw new Error(
      error instanceof Error ? error.message : "Error getting jobs."
    );
  }
};

export const getJobById = async (id: number) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return null;
    }

    if (job.description === "") {
      const jobDescription = await piloterrService.fetchJobDescription(job.url);

      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          description: jobDescription,
        },
      });

      return updatedJob;
    }

    return job;
  } catch (error) {
    console.log(`Error getting job of ID ${id}:`, error);
    throw new Error(
      error instanceof Error ? error.message : `Error getting job of ID ${id}.`
    );
  }
};

export const deleteJobById = async (id: number) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return null;
    }

    const deletedJob = await prisma.job.delete({ where: { id } });

    return deletedJob;
  } catch (error) {
    console.log(`Error deleting job of ID ${id}:`, error);
    throw new Error(
      error instanceof Error ? error.message : `Error deleting job of ID ${id}.`
    );
  }
};

export const updateJobById = async (
  id: number,
  updateData: Partial<JobData>
) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return null;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return updatedJob;
  } catch (error) {
    console.log(`Error updating job of ID ${id}:`, error);
    throw new Error(
      error instanceof Error ? error.message : `Error updating job of ID ${id}.`
    );
  }
};
