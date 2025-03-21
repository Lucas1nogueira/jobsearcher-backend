import * as authService from "../services/authService";
import * as userService from "../services/userService";
import * as jobService from "../services/jobService";
import * as applicationService from "../services/applicationService";
import { AuthenticationError } from "apollo-server-express";

interface Context {
  user?: { userId: number; email: string };
}

interface SignupArgs {
  name: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface UpdateUserArgs {
  id: number;
  data: { name?: string; email?: string; password?: string };
}

interface DeleteUserArgs {
  id: number;
}

interface UpdateJobArgs {
  id: number;
  data: {
    title?: string;
    company?: string;
    companyURL?: string;
    location?: string;
    description?: string;
    postedAt?: Date;
  };
}

interface DeleteJobArgs {
  id: number;
}

interface CreateApplicationArgs {
  userId: number;
  jobId: number;
}

interface DeleteApplicationArgs {
  userId: number;
  applicationId: number;
}

function parseId(id: string | number): number {
  return typeof id === "string" ? parseInt(id, 10) : id;
}

export const resolvers = {
  Query: {
    users: async () => {
      const result = await userService.getUsers();

      if (!result) {
        throw new Error("Users not found");
      }

      return result;
    },

    user: async (_: unknown, { id }: { id: string | number }) => {
      const numericId = parseId(id);

      const result = await userService.getUserById(numericId);

      if (!result) {
        throw new Error("User not found");
      }

      return result;
    },

    jobs: async () => {
      const result = await jobService.getJobs();
      if (!result) {
        throw new Error("Jobs not found");
      }
      return result;
    },

    job: async (_: unknown, { id }: { id: string | number }) => {
      const numericId = parseId(id);

      const result = await jobService.getJobById(numericId);

      if (!result) {
        throw new Error("Job not found");
      }

      return result;
    },

    applications: async () => {
      const result = await applicationService.getApplications();

      if (!result) {
        throw new Error("Applications not found");
      }

      return result;
    },

    application: async (
      _: unknown,
      {
        applicationId,
      }: { userId: string | number; applicationId: string | number }
    ) => {
      const numericApplicationId = parseId(applicationId);

      const result = await applicationService.getApplicationById(
        numericApplicationId
      );

      if (!result) {
        throw new Error("Application not found");
      }

      return result;
    },

    applicationsByUser: async (
      _: unknown,
      { userId }: { userId: string | number }
    ) => {
      const numericUserId = parseId(userId);

      const result = await applicationService.getApplicationsByUserId(
        numericUserId
      );

      if (!result) {
        throw new Error("Applications not found");
      }

      return result;
    },
  },

  Mutation: {
    signup: async (_: unknown, { name, email, password }: SignupArgs) => {
      const response = await authService.signup(name, email, password);
      if (!response) {
        throw new Error("Signup failed");
      }
      return {
        token: response,
      };
    },

    login: async (_: unknown, { email, password }: LoginArgs) => {
      const response = await authService.login(email, password);
      if (!response) {
        throw new Error("Login failed");
      }
      return {
        token: response,
      };
    },

    updateUser: async (
      _: unknown,
      { id, data }: UpdateUserArgs,
      context: Context
    ) => {
      const userId = parseId(id);
      if (!context.user || context.user.userId !== userId) {
        throw new AuthenticationError("Not authorized");
      }

      const updatedUser = await userService.updateUserById(userId, data);
      if (!updatedUser) {
        throw new Error("User not found or update failed");
      }
      return updatedUser;
    },

    deleteUser: async (
      _: unknown,
      { id }: DeleteUserArgs,
      context: Context
    ) => {
      const userId = parseId(id);
      if (!context.user || context.user.userId !== userId) {
        throw new AuthenticationError("Not authorized");
      }

      await userService.deleteUserById(userId);
      return { message: "User deleted successfully" };
    },

    updateJob: async (_: unknown, { id, data }: UpdateJobArgs) => {
      const jobId = parseId(id);
      const updatedJob = await jobService.updateJobById(jobId, data);
      if (!updatedJob) {
        throw new Error("Job not found or update failed");
      }
      return updatedJob;
    },

    deleteJob: async (_: unknown, { id }: DeleteJobArgs) => {
      const jobId = parseId(id);
      await jobService.deleteJobById(jobId);
      return { message: "Job deleted successfully" };
    },

    createApplication: async (
      _: unknown,
      { userId, jobId }: CreateApplicationArgs
    ) => {
      const numericUserId = parseId(userId);
      const numericJobId = parseId(jobId);
      const response = await applicationService.saveApplication(
        numericUserId,
        numericJobId
      );
      if (!response) {
        throw new Error("Failed to create application");
      }
      return {
        message: "Application created successfully",
        application: response,
      };
    },

    deleteApplication: async (
      _: unknown,
      { applicationId }: DeleteApplicationArgs,
      context: Context
    ) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }

      const numericApplicationId = parseId(applicationId);
      await applicationService.deleteApplicationById(
        context.user.userId,
        numericApplicationId
      );
      return { message: "Application deleted successfully" };
    },
  },
};
