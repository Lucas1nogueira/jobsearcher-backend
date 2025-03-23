import request from "supertest";
import { app } from "../../src/app";

let token: string;
let userId: number | undefined;

const mockUser = {
  name: "Test User",
  email: "user@test.com",
  password: "123456",
};

beforeAll(async () => {
  const response = await request(app).post("/signup").send(mockUser);

  token = response.body.token;
  userId = response.body.user.id;
});

describe("REST User API", () => {
  it("GET /users should return a list of users", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("GET /users/:id should return a single user", async () => {
    const response = await request(app)
      .get(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  it("GET /users/:id should return 404 if user not found", async () => {
    const response = await request(app)
      .get("/users/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
  });

  it("PATCH /users/:id should update a user and return status 200", async () => {
    const response = await request(app)
      .patch(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated User" });

    expect(response.status).toBe(200);
    expect(response.body.updatedUser.name).toBe("Updated User");
  });

  it("PATCH /users/:id should return 403 if user tries to update another user", async () => {
    const response = await request(app)
      .patch("/users/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nonexistent" });

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Access denied.");
  });

  it("DELETE /users/:id should delete a user and return status 200", async () => {
    const response = await request(app)
      .delete(`/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User successfully deleted.");
  });

  it("DELETE /users/:id should return 403 if user tries to delete another user", async () => {
    const response = await request(app)
      .delete("/users/99999")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Access denied.");
  });
});
