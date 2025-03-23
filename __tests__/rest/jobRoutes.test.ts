import request from "supertest";
import { app } from "../../src/app";

let jobId: number;

describe("REST Job API", () => {
  it("POST /jobs should create a new job", async () => {
    const jobData = {
      title: "Test Job",
      url: "https://test.com/job/test-job",
      description: "Exciting opportunity at Test Company.",
      company: "Test Company",
      companyURL: "https://test.com",
      location: "Remote",
    };

    const response = await request(app).post("/jobs").send(jobData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Job created successfully.");
    expect(response.body.job).toHaveProperty("id");

    jobId = response.body.job.id;
  });

  it("GET /jobs should return a list of jobs", async () => {
    const response = await request(app).get("/jobs");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("GET /jobs/:id should return a single job", async () => {
    const response = await request(app).get(`/jobs/${jobId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", jobId);
  });

  it("GET /jobs/:id should return 400 if job ID is invalid", async () => {
    const response = await request(app).get("/jobs/invalid");
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid job ID format.");
  });

  it("PATCH /jobs/:id should update a job", async () => {
    const updateData = { title: "Senior Software Engineer" };
    const response = await request(app)
      .patch(`/jobs/${jobId}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Job successfully updated.");
    expect(response.body.updatedJob.title).toBe("Senior Software Engineer");
  });

  it("PATCH /jobs/:id should return 404 if job not found", async () => {
    const response = await request(app)
      .patch("/jobs/999999")
      .send({ title: "Nonexistent" });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Job not found.");
  });

  it("DELETE /jobs/:id should delete a job", async () => {
    const response = await request(app).delete(`/jobs/${jobId}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Job successfully deleted.");
  });

  it("DELETE /jobs/:id should return 404 if job not found", async () => {
    const response = await request(app).delete("/jobs/999999");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Job not found.");
  });
});
