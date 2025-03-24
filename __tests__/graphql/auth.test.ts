import request from "supertest";
import { app } from "../../src/app";
import prisma from "../../src/config/prisma";
import * as authService from "../../src/services/authService";

const mockUser = {
  name: "Test User",
  email: "auth@graphql.com",
  password: "123456",
};

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: mockUser.email },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: mockUser.email },
  });
});

describe("GraphQL Auth API", () => {
  describe("Mutation signup", () => {
    it("should create a new user and return a token", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              signup(
                name: "${mockUser.name}",
                email: "${mockUser.email}",
                password: "${mockUser.password}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.signup.message).toBe("Signup successful.");
      expect(response.body.data.signup.user).toHaveProperty("id");
      expect(response.body.data.signup.user.name).toBe(mockUser.name);
      expect(response.body.data.signup.user.email).toBe(mockUser.email);
      expect(response.body.data.signup.token).toBeDefined();
    });

    it("should return error if required fields are missing", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              signup(
                email: "${mockUser.email}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toMatch(
        /argument "name" of type "String!" is required/i
      );
    });

    it("should return error if email is already in use", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              signup(
                name: "${mockUser.name}",
                email: "${mockUser.email}",
                password: "${mockUser.password}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Email already in use.");
    });

    it("should return error if there is a server error", async () => {
      jest
        .spyOn(authService, "signup")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              signup(
                name: "${mockUser.name}",
                email: "${mockUser.email}",
                password: "${mockUser.password}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Mutation login", () => {
    it("should log in a user and return a token", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              login(
                email: "${mockUser.email}",
                password: "${mockUser.password}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.login.message).toBe("Login successful.");
      expect(response.body.data.login.user).toHaveProperty("id");
      expect(response.body.data.login.user.name).toBe(mockUser.name);
      expect(response.body.data.login.user.email).toBe(mockUser.email);
      expect(response.body.data.login.token).toBeDefined();
    });

    it("should return error if required fields are missing", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              login(
                email: "${mockUser.email}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toMatch(
        /argument "password" of type "String!" is required/i
      );
    });

    it("should return error if email is not found", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              login(
                email: "nonexistent@graphql.com",
                password: "${mockUser.password}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("User email not found.");
    });

    it("should return error if there is a server error", async () => {
      jest
        .spyOn(authService, "login")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              login(
                email: "${mockUser.email}",
                password: "${mockUser.password}"
              ) {
                message
                user {
                  id
                  name
                  email
                }
                token
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
