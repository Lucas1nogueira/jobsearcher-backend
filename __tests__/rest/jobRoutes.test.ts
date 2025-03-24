import request from "supertest";
import { app } from "../../src/app";
import prisma from "../../src/config/prisma";
import * as jobService from "../../src/services/jobService";

let jobId: number;

afterAll(async () => {
  if (jobId) {
    await prisma.job.deleteMany({
      where: { id: jobId },
    });
  }
});

describe("REST Job API", () => {
  describe("POST /jobs", () => {
    it("should create a new job", async () => {
      const jobData = {
        title: "Test Job",
        url: "https://rest.com/job/test-job",
        description: "Exciting opportunity at Test Company.",
        company: "Test Company",
        companyURL: "https://rest.com",
        location: "Remote",
      };

      const response = await request(app).post("/jobs").send(jobData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Job created successfully.");
      expect(response.body.job).toHaveProperty("id");

      jobId = response.body.job.id;
    });

    it("should return 400 if required fields are missing", async () => {
      const incompleteJobData = {
        title: "Incomplete Job",
        url: "https://rest.com/job/incomplete-job",
      };

      const response = await request(app).post("/jobs").send(incompleteJobData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Title, URL, description, company, companyURL and location are required."
      );
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "saveJob")
        .mockRejectedValue(new Error("Something went wrong."));

      const jobData = {
        title: "Test Job",
        url: "https://rest.com/job/test-job",
        description: "Exciting opportunity at Test Company.",
        company: "Test Company",
        companyURL: "https://rest.com",
        location: "Remote",
      };

      const response = await request(app).post("/jobs").send(jobData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("GET /jobs", () => {
    it("should return a list of jobs", async () => {
      const response = await request(app).get("/jobs");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 400 if keyword is invalid", async () => {
      const response = await request(app).get("/jobs").query({ keyword: "  " });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Keyword is required.");
    });

    it("should return 400 if location is invalid", async () => {
      const response = await request(app).get("/jobs").query({ location: " " });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Location is required.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "getJobs")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app).get("/jobs");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("GET /jobs/:id", () => {
    it("should return a single job", async () => {
      const response = await request(app).get(`/jobs/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", jobId);
    });

    it("should return 400 if job ID is invalid", async () => {
      const response = await request(app).get("/jobs/invalid");
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid job ID format.");
    });

    it("should return 404 if job is not found", async () => {
      const response = await request(app).get("/jobs/99999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Job not found.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "getJobById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app).get(`/jobs/${jobId}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("PATCH /jobs/:id", () => {
    it("should update a job", async () => {
      const updateData = { title: "Test Updated" };
      const response = await request(app)
        .patch(`/jobs/${jobId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Job successfully updated.");
      expect(response.body.updatedJob.title).toBe("Test Updated");
    });

    it("should return 400 if job ID is invalid", async () => {
      const response = await request(app)
        .patch("/jobs/invalid")
        .send({ title: "Invalid Job" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid job ID format.");
    });

    it("should return 400 if no update data is provided", async () => {
      const response = await request(app).patch(`/jobs/${jobId}`).send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No update data provided.");
    });

    it("should return 404 if job not found", async () => {
      const response = await request(app)
        .patch("/jobs/99999")
        .send({ title: "Nonexistent" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Job not found.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "updateJobById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .patch(`/jobs/${jobId}`)
        .send({ title: "Test Updated" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("DELETE /jobs/:id", () => {
    it("should delete a job", async () => {
      const response = await request(app).delete(`/jobs/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Job successfully deleted.");
    });

    it("should return 400 if job ID is invalid", async () => {
      const response = await request(app).delete("/jobs/invalid");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid job ID format.");
    });

    it("should return 404 if job not found", async () => {
      const response = await request(app).delete("/jobs/99999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Job not found.");
    });

    it("should return 500 if there is an internal server error", async () => {
      jest
        .spyOn(jobService, "deleteJobById")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app).delete(`/jobs/${jobId}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });
});
