import { Request, RequestHandler, Response } from "express";
import * as authService from "../services/authService";

export const signup: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required." });
    }

    const authInfo = await authService.signup(name, email, password);

    if (!authInfo) {
      return res.status(409).json({ error: "Email already in use." });
    }

    const { user, token } = authInfo;

    return res
      .status(201)
      .json({ message: "User created successfully.", user, token });
  } catch (error) {
    console.error("Signup error:", error);
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

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const authInfo = await authService.login(email, password);

    if (!authInfo) {
      return res.status(401).json({ error: "User email not found." });
    }

    const { user, token } = authInfo;

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
