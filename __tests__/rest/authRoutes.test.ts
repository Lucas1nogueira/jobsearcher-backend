import request from "supertest";
import { app } from "../../src/app";
import * as authService from "../../src/services/authService";
import prisma from "../../src/config/prisma";

const mockNewUser = {
  name: "Test User",
  email: "auth@test.com",
  password: "123456",
};

const mockExistingUser = {
  email: "auth@test.com",
  password: "123456",
};

beforeAll(async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  await prisma.user.deleteMany({
    where: { email: mockNewUser.email },
  });
});

afterAll(async () => {
  jest.spyOn(console, "error").mockRestore();
  await prisma.user.delete({
    where: { email: mockNewUser.email },
  });
});

describe("REST Auth API", () => {
  describe("POST /signup", () => {
    it("should create a new user and return a token", async () => {
      const response = await request(app).post("/signup").send(mockNewUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully.");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.token).toBeDefined();
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/signup").send({
        name: "Test User",
        email: "auth@test.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Name, email and password are required."
      );
    });

    it("should return 409 if email is already in use", async () => {
      jest.spyOn(authService, "signup").mockResolvedValueOnce(null);

      const response = await request(app).post("/signup").send(mockNewUser);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("Email already in use.");
    });

    it("should return 500 if there is a server error", async () => {
      jest
        .spyOn(authService, "signup")
        .mockRejectedValueOnce(new Error("Something went wrong"));

      const response = await request(app).post("/signup").send(mockNewUser);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong");
    });
  });

  describe("POST /login", () => {
    it("should log in a user and return a token", async () => {
      const response = await request(app).post("/login").send(mockExistingUser);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful.");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.token).toBeDefined();
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/login").send({
        email: "auth@test.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Email and password are required.");
    });

    it("should return 401 if user email is not found", async () => {
      jest.spyOn(authService, "login").mockResolvedValueOnce(null);

      const response = await request(app).post("/login").send({
        email: "invalid@email.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User email not found.");
    });

    it("should return 500 if there is a server error", async () => {
      jest
        .spyOn(authService, "login")
        .mockRejectedValueOnce(new Error("Something went wrong"));

      const response = await request(app).post("/login").send(mockExistingUser);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong");
    });
  });
});
