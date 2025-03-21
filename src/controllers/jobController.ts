import { RequestHandler, Request, Response } from "express";
import * as jobService from "../services/jobService";
import * as piloterrService from "../services/piloterrService";

export const fetchAndSaveJobs: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({
        error: "Missing 'keyword' parameter.",
      });
    }

    const apiJobs = await piloterrService.fetchJobs(keyword as string);

    const savedJobs = await jobService.saveJobs(apiJobs);

    return res
      .status(201)
      .json({ message: "Jobs successfully fetched and saved.", savedJobs });
  } catch (error) {
    console.error("Error fetching and saving jobs:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getJobs: RequestHandler = async (req: Request, res: Response) => {
  try {
    const jobs = await jobService.getJobs();
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
