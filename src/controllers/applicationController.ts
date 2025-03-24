import { Request, Response } from "express";
import * as applicationService from "../services/applicationService";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const saveApplication = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "User not authenticated." });
    }

    if (!jobId || typeof jobId !== "number") {
      return res
        .status(400)
        .json({ error: "Job ID is required in a valid format." });
    }

    const application = await applicationService.saveApplication(userId, jobId);

    if (!application) {
      return res.status(401).json({
        error: "Could not find user or job, or application already exists.",
      });
    }

    return res.status(201).json({
      message: "Application successfully saved.",
      application,
    });
  } catch (error) {
    console.error("Error creating application:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await applicationService.getApplications();

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error getting applications:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getApplication = async (req: Request, res: Response) => {
  try {
    const applicationId = req.params.id;
    const parsedApplicationId = parseInt(applicationId, 10);

    if (isNaN(parsedApplicationId)) {
      return res.status(400).json({ error: "Invalid application ID format." });
    }

    const application = await applicationService.getApplicationById(
      parsedApplicationId
    );

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    return res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getApplicationsByUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId;

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const applications = await applicationService.getApplicationsByUserId(
      userId
    );

    return res.status(200).json(applications);
  } catch (error) {
    console.error("Error getting user applications:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const applicationId = req.params.id;
    const userId = req.userId;

    if (!userId || typeof userId !== "number") {
      return res.status(401).json({ error: "User not authenticated." });
    }

    const parsedApplicationId = parseInt(applicationId, 10);

    if (isNaN(parsedApplicationId)) {
      return res.status(400).json({ error: "Invalid application ID format." });
    }

    const deletedApplication = await applicationService.deleteApplicationById(
      userId,
      parsedApplicationId
    );

    if (!deletedApplication) {
      return res.status(404).json({ error: "Application not found." });
    }

    return res
      .status(200)
      .json({ message: "Application successfully deleted." });
  } catch (error) {
    console.error("Error deleting application:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};
