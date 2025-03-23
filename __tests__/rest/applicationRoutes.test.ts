import request from "supertest";
import { app } from "../../src/app";
import prisma from "../../src/config/prisma";

let token: string;
let userId: number;
let jobId: number;
let applicationId: number;

const mockUser = {
  name: "Test User",
  email: "application@test.com",
  password: "123456",
};

beforeAll(async () => {
  const response = await request(app).post("/signup").send(mockUser);

  token = response.body.token;
  userId = response.body.user.id;
});

afterAll(async () => {
  await prisma.user.delete({
    where: { id: userId },
  });

  await prisma.job.delete({
    where: { id: jobId },
  });
});

describe("REST Application Routes", () => {
  it("should save an application for an authenticated user", async () => {
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

    const response = await request(app)
      .post("/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ jobId });

    applicationId = response.body.application.id;

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Application successfully saved.");
    expect(response.body.application).toHaveProperty("id");
    expect(response.body.application.jobId).toBe(newJob.id);
  });

  it("should return 401 if user is not authenticated when saving an application", async () => {
    const response = await request(app).post("/applications").send({ jobId });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("User not authenticated.");
  });

  it("should return 401 if jobId is missing when saving an application", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Job ID is required in a valid format.");
  });

  it("should return all applications", async () => {
    const response = await request(app).get("/applications");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

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
    const response = await request(app).get("/applications/9999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Application not found.");
  });

  it("should return applications by user", async () => {
    const response = await request(app)
      .get("/applicationsByUser")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return 401 if user is not authenticated when fetching applications by user", async () => {
    const response = await request(app).get("/applicationsByUser");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("User not authenticated.");
  });

  it("should delete an application", async () => {
    const response = await request(app)
      .delete(`/applications/${applicationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Application successfully deleted.");
  });

  it("should return 401 if user is not authenticated when deleting an application", async () => {
    const response = await request(app).delete("/applications/1");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("User not authenticated.");
  });

  it("should return 400 if application ID is invalid when deleting", async () => {
    const response = await request(app)
      .delete("/applications/invalid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid application ID format.");
  });

  it("should return 404 if application is not found when deleting", async () => {
    const response = await request(app)
      .delete("/applications/9999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Application not found.");
  });
});
