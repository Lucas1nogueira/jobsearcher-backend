import request from "supertest";
import { app } from "../../src/app";
import prisma from "../../src/config/prisma";
import * as userService from "../../src/services/userService";

let token: string;
let userId: number | undefined;

const mockUser = {
  name: "Test User",
  email: "user@rest.com",
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
});

afterAll(async () => {
  await deleteMockUser();
});

describe("REST User API", () => {
  describe("GET /users", () => {
    it("should return a list of users", async () => {
      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(userService, "getUsers")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .get("/users")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("GET /users/:id", () => {
    it("should return a single user", async () => {
      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it("should return 400 if user ID is invalid", async () => {
      const response = await request(app)
        .get("/users/abc")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user ID format.");
    });

    it("should return 404 if user not found", async () => {
      const response = await request(app)
        .get("/users/99999")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(userService, "getUserById")
        .mockRejectedValueOnce(new Error("Something went wrong."));

      const response = await request(app)
        .get(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update a user and return status 200", async () => {
      const response = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });

      expect(response.status).toBe(200);
      expect(response.body.updatedUser.name).toBe("Updated User");
    });

    it("should return 400 if user ID format is invalid", async () => {
      const response = await request(app)
        .patch("/users/abc")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user ID format.");
    });

    it("should return 403 if user tries to update another user", async () => {
      const response = await request(app)
        .patch("/users/99999")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Nonexistent" });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Access denied.");
    });

    it("should return 400 if no update data is provided", async () => {
      const response = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("No update data provided.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(userService, "updateUserById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .patch(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Updated User" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user and return status 200", async () => {
      const response = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User successfully deleted.");
    });

    it("should return 400 if user ID format is invalid", async () => {
      const response = await request(app)
        .delete("/users/abc")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user ID format.");
    });

    it("should return 403 if user tries to delete another user", async () => {
      const response = await request(app)
        .delete("/users/99999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Access denied.");
    });

    it("should return 500 if an internal error occurs", async () => {
      jest
        .spyOn(userService, "deleteUserById")
        .mockRejectedValue(new Error("Something went wrong."));

      const response = await request(app)
        .delete(`/users/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Something went wrong.");
    });
  });
});
