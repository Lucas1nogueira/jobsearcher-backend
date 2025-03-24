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
        const userId = parseId(id);

        if (isNaN(userId)) {
          throw new Error("Invalid user ID format.");
        }

        const user = await userService.getUserById(userId);

        return user;
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

        if (isNaN(numericId)) {
          throw new Error("Invalid job ID format.");
        }

        const job = await jobService.getJobById(numericId);

        if (!job) {
          throw new Error("Job not found.");
        }

        return job;
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

        if (isNaN(numericApplicationId)) {
          throw new Error("Invalid application ID format.");
        }

        const application = await applicationService.getApplicationById(
          numericApplicationId
        );

        if (!application) {
          throw new Error("Application not found.");
        }

        return application;
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

        if (isNaN(userId)) {
          throw new Error("Invalid user ID format.");
        }

        if (!contextUserId || contextUserId !== userId) {
          throw new AuthenticationError("Not authorized.");
        }

        if (Object.keys(data).length === 0) {
          throw new Error("No update data provided.");
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

        if (isNaN(userId)) {
          throw new Error("Invalid user ID format.");
        }

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

        if (isNaN(jobId)) {
          throw new Error("Invalid job ID format.");
        }

        if (Object.keys(data).length === 0) {
          throw new Error("No update data provided.");
        }

        const updatedJob = await jobService.updateJobById(jobId, data);

        if (!updatedJob) {
          throw new Error("Job not found.");
        }

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

        if (isNaN(jobId)) {
          throw new Error("Invalid job ID format.");
        }

        const deletedJob = await jobService.deleteJobById(jobId);

        if (!deletedJob) {
          throw new Error("Job not found.");
        }

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

        if (isNaN(numericJobId)) {
          throw new Error("Job ID is required in a valid format.");
        }

        const newApplication = await applicationService.saveApplication(
          numericUserId,
          numericJobId
        );

        if (!newApplication) {
          throw new Error(
            "Could not find user or job, or application already exists."
          );
        }

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

        if (isNaN(applicationId)) {
          throw new Error("Invalid application ID format.");
        }

        const deletedApplication =
          await applicationService.deleteApplicationById(
            contextUserId,
            applicationId
          );

        if (!deletedApplication) {
          throw new Error("Application not found.");
        }

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
