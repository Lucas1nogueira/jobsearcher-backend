import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";

const generateToken = (userId: number, email: string) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

export const signup = async (name: string, email: string, password: string) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return null;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = generateToken(newUser.id, newUser.email);

    return {
      user: newUser,
      token,
    };
  } catch (error) {
    console.log("Signup error:", error);
    throw new Error(error instanceof Error ? error.message : "Signup error.");
  }
};

export const login = async (email: string, password: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    const token = generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  } catch (error) {
    console.log("Login error:", error);
    throw new Error(error instanceof Error ? error.message : "Login error.");
  }
};
