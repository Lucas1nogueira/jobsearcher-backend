import prisma from "../config/prisma";
import { hashPassword } from "./authService";

export const getUsers = async () => {
  try {
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
  } catch (error) {
    console.log("Error getting users:", error);
    throw new Error(
      error instanceof Error ? error.message : "Error getting users."
    );
  }
};

export const getUserById = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        applications: true,
      },
    });

    return user;
  } catch (error) {
    console.log(`Error getting user of ID ${id}:`, error);
    throw new Error(
      error instanceof Error ? error.message : `Error getting user of ID ${id}.`
    );
  }
};

export const deleteUserById = async (id: number) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.log(`Error deleting user of ID ${id}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error deleting user of ID ${id}.`
    );
  }
};

export const updateUserById = async (
  id: number,
  updateData: Partial<{ name: string; email: string; password: string }>
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (updateData.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingEmail) {
        throw new Error("Email already in use.");
      }
    }

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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
  } catch (error) {
    console.log(`Error updating user of ID ${id}:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Error updating user of ID ${id}.`
    );
  }
};
