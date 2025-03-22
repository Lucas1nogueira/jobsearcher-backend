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
    url: String!
    description: String!
    company: String!
    companyURL: String!
    location: String!
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

  input UpdateJobInput {
    title: String
    url: String
    description: String
    company: String
    companyURL: String
    location: String
  }

  type AuthResponse {
    message: String!
    user: User
    token: String
  }

  type DeleteResponse {
    message: String!
  }

  ${queries}
  ${mutations}
`;
