import prisma from "./src/config/prisma";
import { startApolloServer, stopApolloServer } from "./src/app";

beforeAll(async () => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  await startApolloServer();
});

afterAll(async () => {
  jest.spyOn(console, "error").mockRestore();
  await stopApolloServer();
  await prisma.$disconnect();
});
