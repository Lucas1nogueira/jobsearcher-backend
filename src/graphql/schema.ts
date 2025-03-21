import { gql } from "apollo-server-express";
import { queries } from "./queries";
import { mutations } from "./mutations";

export const typeDefs = gql`
  scalar DateTime

  type User {
    id: Int!
    name: String!
    email: String!
    createdAt: DateTime!
    applications: [Application!]!
  }

  type Job {
    id: Int!
    title: String!
    company: String!
    companyURL: String!
    location: String!
    description: String!
    postedAt: DateTime!
    createdAt: DateTime!
    applications: [Application!]!
  }

  type Application {
    id: Int!
    appliedAt: DateTime!
    user: User!
    job: Job!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
  }

  input UpdateUserInput {
    name: String
    email: String
    password: String
  }

  input CreateJobInput {
    title: String!
    company: String!
    companyURL: String!
    location: String!
    description: String!
    postedAt: DateTime!
  }

  input UpdateJobInput {
    title: String
    company: String
    companyURL: String
    location: String
    description: String
    postedAt: DateTime
  }

  input CreateApplicationInput {
    userId: Int!
    jobId: Int!
  }

  ${queries}
  ${mutations}
`;
