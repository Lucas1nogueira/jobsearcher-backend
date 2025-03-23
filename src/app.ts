import express, { Application, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: number;
}

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(userRoutes);
app.use(jobRoutes);
app.use(applicationRoutes);

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: { req: AuthRequest }) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return {};
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      const userId = (decoded as { userId: number }).userId;

      return { userId };
    } catch (error) {
      console.error("Invalid or expired token.");
      return {};
    }
  },
});

export const startApolloServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
};

export const stopApolloServer = async () => {
  await apolloServer.stop();
};

if (process.env.NODE_ENV !== "test") {
  startApolloServer();
}

export { app };
