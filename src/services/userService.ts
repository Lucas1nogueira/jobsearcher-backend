import prisma from "../config/prisma";
import { hashPassword } from "./authService";

export const getUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      applications: true,
    },
  });

  return users;
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      applications: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

export const deleteUserById = async (userId: number) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  await prisma.user.delete({
    where: { id: userId },
  });
};

export const updateUserById = async (
  userId: number,
  updateData: Partial<{ name: string; email: string; password: string }>
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      applications: true,
    },
  });

  return updatedUser;
};
