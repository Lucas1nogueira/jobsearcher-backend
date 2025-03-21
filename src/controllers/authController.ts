import { Request, RequestHandler, Response } from "express";
import * as authService from "../services/authService";

export const signup: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    const { user, token } = await authService.signup(name, email, password);

    return res
      .status(201)
      .json({ message: "User created successfully.", user, token });
  } catch (error) {
    console.error("Error during signup:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};

export const login: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

    return res.status(200).json({ message: "Login successful.", user, token });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: "Internal server error." });
    }
  }
};
