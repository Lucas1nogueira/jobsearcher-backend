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
  email: "application@graphql.com",
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

describe("GraphQL Application API", () => {
  describe("Mutation createApplication", () => {
    it("should save an application for an authenticated user", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              createApplication(userId: "${userId}", jobId: "${jobId}") {
                id
                user {
                  id
                }
                job {
                  id
                }
                appliedAt
              }
            }
          `,
        });

      applicationId = response.body.data.createApplication.id;

      expect(response.status).toBe(200);
      expect(response.body.data.createApplication).toHaveProperty("id");
      expect(response.body.data.createApplication.user).toHaveProperty(
        "id",
        userId
      );
      expect(response.body.data.createApplication.job).toHaveProperty(
        "id",
        jobId
      );
    });

    it("should return error if user is not authenticated", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              createApplication(userId: "${userId}", jobId: "${jobId}") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return error if jobId is missing", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              createApplication(userId: "${userId}", jobId: "") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "Job ID is required in a valid format."
      );
    });

    it("should return error if jobId is not in a valid format", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              createApplication(userId: "${userId}", jobId: "invalid") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "Job ID is required in a valid format."
      );
    });

    it("should return error if application already exists or user/job not found", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              createApplication(userId: "${userId}", jobId: "${jobId}") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "Could not find user or job, or application already exists."
      );
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "saveApplication")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              createApplication(userId: "${userId}", jobId: "${jobId}") {
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

  describe("Query applications", () => {
    it("should return all applications", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              applications {
                id
                user {
                  id
                }
                job {
                  id
                }
                appliedAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.applications).toBeInstanceOf(Array);
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "getApplications")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              applications {
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

  describe("Query application", () => {
    it("should return a specific application by ID", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              application(id: "${applicationId}") {
                id
                user {
                  id
                }
                job {
                  id
                }
                appliedAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.application).toHaveProperty(
        "id",
        applicationId
      );
      expect(response.body.data.application.user).toHaveProperty("id");
      expect(response.body.data.application.job).toHaveProperty("id");
      expect(response.body.data.application).toHaveProperty("appliedAt");
    });

    it("should return error for invalid application ID format", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            query {
              application(id: "invalid-id") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "Invalid application ID format."
      );
    });

    it("should return error if application is not found", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              application(id: "99999") {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Application not found.");
    });

    it("should return error if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "getApplicationById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              application(id: "${applicationId}") {
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

  describe("Query applicationsByUser", () => {
    it("should return applications by user", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            query {
              applicationsByUser {
                id
                user {
                  id
                }
                job {
                  id
                }
                appliedAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.applicationsByUser).toBeInstanceOf(Array);
    });

    it("should return error if user is not authenticated", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            query {
              applicationsByUser {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return 200 if an internal error occurs", async () => {
      jest
        .spyOn(applicationService, "getApplicationsByUserId")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            query {
              applicationsByUser {
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

  describe("Mutation deleteApplication", () => {
    it("should delete an application", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteApplication(id: ${applicationId}) {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.deleteApplication).toHaveProperty(
        "message",
        "Application deleted successfully."
      );
    });

    it("should return error if user is not authenticated", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              deleteApplication(id: ${applicationId}) {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return error if application ID is invalid", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteApplication(id: "invalid") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "Invalid application ID format."
      );
    });

    it("should return error if application is not found", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteApplication(id: "99999") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Application not found.");
    });

    it("should return error if an internal error occurs", async () => {
      const applicationId = 1;

      jest
        .spyOn(applicationService, "deleteApplicationById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteApplication(id: ${applicationId}) {
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
