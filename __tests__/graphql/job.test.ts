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

describe("GraphQL Job API", () => {
  describe("Mutation createJob", () => {
    it("should create a new job", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              createJob(
                title: "Test Job",
                url: "https://graphql.com/job/test-job",
                description: "Exciting opportunity at Test Company.",
                company: "Test Company",
                companyURL: "https://graphql.com",
                location: "Remote"
              ) {
                id
                title
                url
                description
                company
                companyURL
                location
                postedAt
                createdAt
              }
            }
          `,
        });

      jobId = response.body.data.createJob.id;

      expect(response.status).toBe(200);
      expect(response.body.data.createJob).toHaveProperty("title", "Test Job");
      expect(response.body.data.createJob).toHaveProperty(
        "url",
        "https://graphql.com/job/test-job"
      );
      expect(response.body.data.createJob).toHaveProperty(
        "description",
        "Exciting opportunity at Test Company."
      );
      expect(response.body.data.createJob).toHaveProperty(
        "company",
        "Test Company"
      );
      expect(response.body.data.createJob).toHaveProperty(
        "companyURL",
        "https://graphql.com"
      );
      expect(response.body.data.createJob).toHaveProperty("location", "Remote");
    });

    it("should return error if required fields are missing", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              createJob(
                company: "Test Company",
                companyURL: "https://graphql.com",
                location: "Remote"
              ) {
                title
                url
                description
                company
                companyURL
                location
                postedAt
                createdAt
              }
            }
          `,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toMatch(
        /argument "title" of type "String!" is required/i
      );
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "saveJob")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              createJob(
                title: "Test Job",
                url: "https://graphql.com/job/test-job",
                description: "Exciting opportunity at Test Company.",
                company: "Test Company",
                companyURL: "https://graphql.com",
                location: "Remote"
              ) {
                title
                url
                description
                company
                companyURL
                location
                postedAt
                createdAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Query jobs", () => {
    it("should return a list of jobs", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            {
              jobs {
                id
                title
                company
                location
                url
                description
                postedAt
                createdAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.jobs)).toBe(true);
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "getJobs")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
          query {
            jobs {
              id
            }
          }
        `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Query job", () => {
    it("should return a single job", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              job(id: "${jobId}") {
                id
                title
                company
                companyURL
                location
                url
                description
                postedAt
                createdAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.job).toHaveProperty("id", jobId);
      expect(response.body.data.job).toHaveProperty("title", "Test Job");
      expect(response.body.data.job).toHaveProperty("company", "Test Company");
      expect(response.body.data.job).toHaveProperty("location", "Remote");
      expect(response.body.data.job).toHaveProperty(
        "url",
        "https://graphql.com/job/test-job"
      );
      expect(response.body.data.job).toHaveProperty(
        "companyURL",
        "https://graphql.com"
      );
      expect(response.body.data.job).toHaveProperty(
        "description",
        "Exciting opportunity at Test Company."
      );
    });

    it("should return error if job ID is invalid", async () => {
      const invalidId = "abc";

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              job(id: "${invalidId}") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid job ID format.");
    });

    it("should return error if job is not found", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              job(id: "99999") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Job not found.");
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "getJobById")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              job(id: "${jobId}") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Mutation updateJob", () => {
    it("should update a job", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              updateJob(
                id: "${jobId}",
                data: {
                  title: "Updated Test Job",
                  url: "https://graphql.com/job/updated-job",
                  description: "Updated exciting opportunity at Test Company.",
                  company: "Updated Test Company",
                  companyURL: "https://graphql.com",
                  location: "Brazil"
                }
              ) {
                id
                title
                url
                description
                company
                companyURL
                location
                postedAt
                createdAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.updateJob).toHaveProperty("id", jobId);
      expect(response.body.data.updateJob).toHaveProperty(
        "title",
        "Updated Test Job"
      );
      expect(response.body.data.updateJob).toHaveProperty(
        "url",
        "https://graphql.com/job/updated-job"
      );
      expect(response.body.data.updateJob).toHaveProperty(
        "description",
        "Updated exciting opportunity at Test Company."
      );
      expect(response.body.data.updateJob).toHaveProperty(
        "company",
        "Updated Test Company"
      );
      expect(response.body.data.updateJob).toHaveProperty(
        "companyURL",
        "https://graphql.com"
      );
      expect(response.body.data.updateJob).toHaveProperty("location", "Brazil");
    });

    it("should return error if job ID is invalid", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              updateJob(
                id: "invalid-id",
                data: {
                  title: "Updated Test Job"
                }
              ) {
                id
                title
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid job ID format.");
    });

    it("should return error if no update data is provided", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              updateJob(
                id: "${jobId}",
                data: {}
              ) {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("No update data provided.");
    });

    it("should return error if job not found", async () => {
      jest.spyOn(jobService, "updateJobById").mockResolvedValueOnce(null);

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              updateJob(
                id: 99999,
                data: {
                  title: "Updated Test Job"
                }
              ) {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Job not found.");
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(jobService, "updateJobById")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              updateJob(
                id: "${jobId}",
                data: {
                  title: "Updated Test Job"
                }
              ) {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Mutation deleteJob", () => {
    it("should delete a job", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              deleteJob(id: "${jobId}") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.deleteJob).toHaveProperty(
        "message",
        "Job deleted successfully."
      );
    });

    it("should return error if job ID is invalid", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              deleteJob(id: "invalid-id") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid job ID format.");
    });

    it("should return error if job not found", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              deleteJob(id: 99999) {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Job not found.");
    });

    it("should return error if there is an internal server error", async () => {
      jest
        .spyOn(jobService, "deleteJobById")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              deleteJob(id: ${jobId}) {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });
});
