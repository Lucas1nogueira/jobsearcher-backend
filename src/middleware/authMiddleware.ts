import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

interface JwtPayload {
  userId: number;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "User not authenticated." });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    const payload = decoded as JwtPayload;
    req.userId = payload.userId;
    next();
  });
};
