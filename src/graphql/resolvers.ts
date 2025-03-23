import * as authService from "../services/authService";
import * as userService from "../services/userService";
import * as jobService from "../services/jobService";
import * as applicationService from "../services/applicationService";
import { AuthenticationError } from "apollo-server-express";

interface AuthContext {
  userId: number;
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

interface GetJobsArgs {
  keyword?: string;
  location?: string;
}

interface CreateJobArgs {
  title: string;
  url: string;
  description: string;
  company: string;
  companyURL: string;
  location: string;
}

interface UpdateJobArgs {
  id: number;
  data: {
    title?: string;
    url?: string;
    description?: string;
    company?: string;
    companyURL?: string;
    location?: string;
  };
}

interface DeleteJobArgs {
  id: number;
}

interface CreateApplicationArgs {
  userId: number;
  jobId: number;
}

function parseId(id: string | number): number {
  return typeof id === "string" ? parseInt(id, 10) : id;
}

export const resolvers = {
  Query: {
    users: async () => {
      try {
        const users = await userService.getUsers();

        return users || [];
      } catch (error) {
        console.error("Error getting users:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting users."
        );
      }
    },

    user: async (_: unknown, { id }: { id: string | number }) => {
      try {
        const numericId = parseId(id);

        const user = await userService.getUserById(numericId);

        return user || null;
      } catch (error) {
        console.error("Error getting user:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting user."
        );
      }
    },

    jobs: async (_: unknown, { keyword, location }: GetJobsArgs) => {
      try {
        const jobs = await jobService.getJobs(keyword, location);

        return jobs || [];
      } catch (error) {
        console.error("Error getting jobs:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting jobs."
        );
      }
    },

    job: async (_: unknown, { id }: { id: string | number }) => {
      try {
        const numericId = parseId(id);

        const job = await jobService.getJobById(numericId);

        return job || null;
      } catch (error) {
        console.error("Error getting job:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting job."
        );
      }
    },

    applications: async () => {
      try {
        const applications = await applicationService.getApplications();

        return applications || [];
      } catch (error) {
        console.error("Error getting applications:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting applications."
        );
      }
    },

    application: async (_: unknown, { id }: { id: string | number }) => {
      try {
        const numericApplicationId = parseId(id);

        const application = await applicationService.getApplicationById(
          numericApplicationId
        );

        return application || null;
      } catch (error) {
        console.error("Error getting application:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting application."
        );
      }
    },

    applicationsByUser: async (
      _: unknown,
      __: unknown,
      context: AuthContext
    ) => {
      try {
        if (!context.userId) {
          throw new AuthenticationError("Not authorized.");
        }

        const userId = parseId(context.userId);

        const applications = await applicationService.getApplicationsByUserId(
          userId
        );

        return applications || [];
      } catch (error) {
        console.error("Error getting applications:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error getting applications."
        );
      }
    },
  },

  Mutation: {
    signup: async (_: unknown, { name, email, password }: SignupArgs) => {
      try {
        const response = await authService.signup(name, email, password);

        if (!response) {
          throw new Error("Email already in use.");
        }

        return {
          message: "Signup successful.",
          user: response.user,
          token: response.token,
        };
      } catch (error) {
        console.error("Signup error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Signup error."
        );
      }
    },

    login: async (_: unknown, { email, password }: LoginArgs) => {
      try {
        const response = await authService.login(email, password);

        if (!response) {
          throw new Error("User email not found.");
        }

        return {
          message: "Login successful.",
          user: response.user,
          token: response.token,
        };
      } catch (error) {
        console.error("Login error:", error);
        throw new Error(
          error instanceof Error ? error.message : "Login error."
        );
      }
    },

    updateUser: async (
      _: unknown,
      { id, data }: UpdateUserArgs,
      context: AuthContext
    ) => {
      try {
        const userId = parseId(id);
        const contextUserId = parseId(context.userId);

        if (!contextUserId || contextUserId !== userId) {
          throw new AuthenticationError("Not authorized.");
        }

        const updatedUser = await userService.updateUserById(userId, data);

        return updatedUser;
      } catch (error) {
        console.error("Error updating user:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error updating user."
        );
      }
    },

    deleteUser: async (
      _: unknown,
      { id }: DeleteUserArgs,
      context: AuthContext
    ) => {
      try {
        const userId = parseId(id);
        const contextUserId = parseId(context.userId);

        if (!contextUserId || contextUserId !== userId) {
          throw new AuthenticationError("Not authorized.");
        }

        await userService.deleteUserById(userId);

        return { message: "User deleted successfully." };
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error deleting user."
        );
      }
    },

    createJob: async (
      _: unknown,
      { title, url, description, company, companyURL, location }: CreateJobArgs
    ) => {
      try {
        const newJob = await jobService.saveJob({
          title,
          url,
          company,
          companyURL,
          description,
          location,
        });

        return newJob;
      } catch (error) {
        console.error("Error creating job:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error creating job."
        );
      }
    },

    updateJob: async (_: unknown, { id, data }: UpdateJobArgs) => {
      try {
        const jobId = parseId(id);

        const updatedJob = await jobService.updateJobById(jobId, data);

        return updatedJob;
      } catch (error) {
        console.error("Error updating job:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error updating job."
        );
      }
    },

    deleteJob: async (_: unknown, { id }: DeleteJobArgs) => {
      try {
        const jobId = parseId(id);

        await jobService.deleteJobById(jobId);

        return { message: "Job deleted successfully." };
      } catch (error) {
        console.error("Error deleting job:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error deleting job."
        );
      }
    },

    createApplication: async (
      _: unknown,
      { userId, jobId }: CreateApplicationArgs,
      context: AuthContext
    ) => {
      try {
        const numericUserId = parseId(userId);
        const contextUserId = parseId(context.userId);

        if (!contextUserId || contextUserId !== numericUserId) {
          throw new AuthenticationError("Not authorized.");
        }

        const numericJobId = parseId(jobId);

        const newApplication = await applicationService.saveApplication(
          numericUserId,
          numericJobId
        );

        return newApplication;
      } catch (error) {
        console.error("Error creating application:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error creating application."
        );
      }
    },

    deleteApplication: async (
      _: unknown,
      { id }: { id: number },
      context: AuthContext
    ) => {
      try {
        const contextUserId = parseId(context.userId);

        if (!contextUserId) {
          throw new AuthenticationError("Not authorized.");
        }

        const applicationId = parseId(id);

        await applicationService.deleteApplicationById(
          contextUserId,
          applicationId
        );

        return { message: "Application deleted successfully." };
      } catch (error) {
        console.error("Error deleting application:", error);
        throw new Error(
          error instanceof Error ? error.message : "Error deleting application."
        );
      }
    },
  },
};
