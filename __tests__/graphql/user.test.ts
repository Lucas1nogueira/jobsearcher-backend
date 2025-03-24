import request from "supertest";
import { app } from "../../src/app";
import prisma from "../../src/config/prisma";
import * as userService from "../../src/services/userService";

let token: string;
let userId: number;

const mockUser = {
  name: "Test User",
  email: "user@graphql.com",
  password: "123456",
};

const deleteMockUser = async () => {
  await prisma.user.deleteMany({
    where: { email: mockUser.email },
  });
};

beforeAll(async () => {
  await deleteMockUser();

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

  token = response.body.data.signup.token;
  userId = Number(response.body.data.signup.user.id);
});

afterAll(async () => {
  await deleteMockUser();
});

describe("GraphQL User API", () => {
  describe("Query users", () => {
    it("should return a list of users", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            {
              users {
                id
                name
                email
                createdAt
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it("should return an error if an internal error occurs", async () => {
      jest
        .spyOn(userService, "getUsers")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            {
              users {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Query user", () => {
    it("should return a user by ID", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            {
              user(id: "${userId}") {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty("id", userId);
      expect(response.body.data.user).toHaveProperty("name", mockUser.name);
      expect(response.body.data.user).toHaveProperty("email", mockUser.email);
    });

    it("should return an error if user ID format is invalid", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            {
              user(id: "abc") {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid user ID format.");
    });

    it("should return an error if an internal error occurs", async () => {
      jest
        .spyOn(userService, "getUserById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            {
              user(id: "${userId}") {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Mutation updateUser", () => {
    it("should update a user", async () => {
      const newName = "Updated Test User";

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              updateUser(id: "${userId}", data: { name: "${newName}" }) {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.updateUser).toHaveProperty("id", userId);
      expect(response.body.data.updateUser).toHaveProperty("name", newName);
      expect(response.body.data.updateUser).toHaveProperty(
        "email",
        mockUser.email
      );
    });

    it("should return an error if user ID format is invalid", async () => {
      const invalidId = "abc";

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              updateUser(id: "${invalidId}", data: { name: "New Name" }) {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid user ID format.");
    });

    it("should return an error if user is not authenticated", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              updateUser(id: "${userId}", data: { name: "New Name" }) {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return an error if authenticated user tries to update another user", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              updateUser(id: "99999", data: { name: "New Name" }) {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return an error if no update data is provided", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              updateUser(id: "${userId}", data: {}) {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("No update data provided.");
    });

    it("should return an error if an internal error occurs", async () => {
      jest
        .spyOn(userService, "updateUserById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              updateUser(id: "${userId}", data: { name: "New Name" }) {
                id
                name
                email
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Something went wrong.");
    });
  });

  describe("Mutation deleteUser", () => {
    it("should delete a user", async () => {
      const deleteResponse = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteUser(id: ${userId}) {
                message
              }
            }
          `,
        });

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.data.deleteUser.message).toBe(
        "User deleted successfully."
      );
    });

    it("should return an error if user ID format is invalid", async () => {
      const invalidId = "abc";

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteUser(id: "${invalidId}") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Invalid user ID format.");
    });

    it("should return an error if user is not authenticated", async () => {
      const response = await request(app)
        .post("/graphql")
        .send({
          query: `
            mutation {
              deleteUser(id: "${userId}") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return an error if authenticated user tries to delete another user", async () => {
      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteUser(id: "99999") {
                message
              }
            }
          `,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe("Not authorized.");
    });

    it("should return an error if an internal error occurs", async () => {
      jest
        .spyOn(userService, "deleteUserById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .post("/graphql")
        .set("Authorization", `Bearer ${token}`)
        .send({
          query: `
            mutation {
              deleteUser(id: "${userId}") {
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
