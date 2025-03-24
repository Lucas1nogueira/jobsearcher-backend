import request from "supertest";
import { app } from "../../src/app";
import prisma from "../../src/config/prisma";
import * as applicationService from "../../src/services/applicationService";

let token: string;
let userId: number;
let jobId: number;
let applicationId: number;

const mockUser = {
  name: "Test User",
  email: "application@rest.com",
  password: "123456",
};

const deleteMockUser = async () => {
  await prisma.user.deleteMany({
    where: { email: mockUser.email },
  });
};

beforeAll(async () => {
  await deleteMockUser();

  const response = await request(app).post("/signup").send(mockUser);

  token = response.body.token;
  userId = response.body.user.id;

  const jobData = {
    title: "Test Job",
    url: "https://test.com/job/test-job",
    description: "Exciting opportunity at Test Company.",
    company: "Test Company",
    companyURL: "https://test.com",
    location: "Remote",
    postedAt: new Date().toISOString(),
  };

  const newJob = await prisma.job.create({
    data: jobData,
  });

  jobId = newJob.id;
});

afterAll(async () => {
  await deleteMockUser();

  if (jobId) {
    await prisma.job.deleteMany({
      where: { id: jobId },
    });
  }

  if (applicationId) {
    await prisma.application.deleteMany({
      where: { id: applicationId },
    });
  }
});

describe("REST Application Routes", () => {
  describe("POST /applications", () => {
    it("should save an application for an authenticated user", async () => {
      const response = await request(app)
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({ jobId });

      applicationId = response.body.application.id;

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Application successfully saved.");
      expect(response.body.application).toHaveProperty("id");
      expect(response.body.application.jobId).toBe(jobId);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app).post("/applications").send({ jobId });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User not authenticated.");
    });

    it("should return 400 if jobId is missing", async () => {
      const response = await request(app)
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Job ID is required in a valid format.");
    });

    it("should return 400 if jobId is not in a valid format", async () => {
      const response = await request(app)
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({ jobId: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Job ID is required in a valid format.");
    });

    it("should return 401 if application already exists or user/job not found", async () => {
      jest;
      const response = await request(app)
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({ jobId });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe(
        "Could not find user or job, or application already exists."
      );
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "saveApplication")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/applications")
        .set("Authorization", `Bearer ${token}`)
        .send({ jobId });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("GET /applications", () => {
    it("should return all applications", async () => {
      const response = await request(app).get("/applications");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "getApplications")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app).get("/applications");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("GET /applications/:id", () => {
    it("should return a specific application by ID", async () => {
      const response = await request(app).get(`/applications/${applicationId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", applicationId);
    });

    it("should return 400 for invalid application ID format", async () => {
      const response = await request(app).get("/applications/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid application ID format.");
    });

    it("should return 404 if application is not found", async () => {
      const response = await request(app).get("/applications/99999");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Application not found.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "getApplicationById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app).get("/applications");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("GET /applicationsByUser", () => {
    it("should return applications by user", async () => {
      const response = await request(app)
        .get("/applicationsByUser")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app).get("/applicationsByUser");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User not authenticated.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "getApplicationsByUserId")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app).get("/applications");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("DELETE /applications/:id", () => {
    it("should delete an application", async () => {
      const response = await request(app)
        .delete(`/applications/${applicationId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Application successfully deleted.");
    });

    it("should return 401 if user is not authenticated", async () => {
      const response = await request(app).delete("/applications/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User not authenticated.");
    });

    it("should return 400 if application ID is invalid", async () => {
      const response = await request(app)
        .delete("/applications/invalid-id")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid application ID format.");
    });

    it("should return 404 if application is not found", async () => {
      const response = await request(app)
        .delete("/applications/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Application not found.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "deleteApplicationById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .delete(`/applications/${applicationId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ jobId });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });
});
