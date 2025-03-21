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

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }: { req: AuthRequest }) => {
    const token = req.headers.authorization || "";

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        const userId = (decoded as { userId: number }).userId;

        return { userId };
      } catch (error) {
        throw new Error("Invalid or expired token.");
      }
    }

    return {};
  },
});

const startServer = async () => {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });

  app.use(authRoutes);
  app.use(userRoutes);
  app.use(jobRoutes);
  app.use(applicationRoutes);

  const PORT = 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
};

startServer();
