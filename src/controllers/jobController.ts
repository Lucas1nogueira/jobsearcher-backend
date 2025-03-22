import { RequestHandler, Request, Response } from "express";
import * as jobService from "../services/jobService";

export const saveJob: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { title, url, description, company, companyURL, location } = req.body;

    if (
      !title ||
      !url ||
      !description ||
      !company ||
      !companyURL ||
      !location
    ) {
      return res.status(400).json({
        error:
          "Title, URL, description, company, companyURL and location are required.",
      });
    }

    const jobData = { title, url, description, company, companyURL, location };

    const job = await jobService.saveJob(jobData);

    return res.status(201).json({ message: "Job created successfully.", job });
  } catch (error) {
    console.error("Error creating job:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getJobs: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { keyword, location } = req.query;

    if (keyword && (typeof keyword !== "string" || !keyword.trim())) {
      return res.status(400).json({ error: "Keyword is required." });
    }

    if (location && (typeof location !== "string" || !location.trim())) {
      return res.status(400).json({ error: "Location is required." });
    }

    const jobs = await jobService.getJobs(
      keyword as string | undefined,
      location as string | undefined
    );

    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error getting jobs:", error);

    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getJob: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required." });
    }

    const jobId = parseInt(id, 10);

    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid job ID format." });
    }

    const job = await jobService.getJobById(jobId);

    return res.status(200).json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const updateJob: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required." });
    }

    const jobId = parseInt(id, 10);

    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid job ID format." });
    }

    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided." });
    }

    const updatedJob = await jobService.updateJobById(jobId, updateData);

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found." });
    }

    return res
      .status(200)
      .json({ message: "Job successfully updated.", updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const deleteJob: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Job ID is required." });
    }

    const jobId = parseInt(id, 10);

    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid job ID format." });
    }

    await jobService.deleteJobById(jobId);

    return res.status(200).json({ message: "Job successfully deleted." });
  } catch (error) {
    console.error("Error deleting job:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};
