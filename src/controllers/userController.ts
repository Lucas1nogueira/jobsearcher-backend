import { Request, RequestHandler, Response } from "express";
import * as userService from "../services/userService";
import { hashPassword } from "../services/authService";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const getUsers: RequestHandler = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsers();

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const getUser: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const updateUser: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const userIdFromToken = req.userId;
    const userIdFromParams = parseInt(id, 10);

    if (isNaN(userIdFromParams)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    if (userIdFromToken !== userIdFromParams) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (!name && !email && !password) {
      return res.status(400).json({ error: "No update data provided." });
    }

    const user = await userService.getUserById(userIdFromParams);
    const updateData: Partial<{
      name: string;
      email: string;
      password: string;
    }> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await hashPassword(password);

    const updatedUser = await userService.updateUserById(
      userIdFromParams,
      updateData
    );

    return res
      .status(200)
      .json({ message: "User successfully updated.", updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const deleteUser: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userIdFromToken = req.userId;
    const userIdFromParams = parseInt(id, 10);

    if (isNaN(userIdFromParams)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    if (userIdFromToken !== userIdFromParams) {
      return res.status(403).json({ error: "Access denied." });
    }

    const user = await userService.getUserById(userIdFromParams);

    await userService.deleteUserById(userIdFromParams);

    return res.status(200).json({ message: "User successfully deleted." });
  } catch (error) {
    console.error("Error deleting user:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};
