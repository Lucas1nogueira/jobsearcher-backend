import { gql } from "apollo-server-express";

export const mutations = gql`
  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    updateUser(id: ID!, data: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    createJob(data: CreateJobInput!): Job!
    updateJob(id: ID!, data: UpdateJobInput!): Job!
    deleteJob(id: ID!): Boolean!

    createApplication(data: CreateApplicationInput!): Application!
    deleteApplication(id: ID!): Boolean!
  }

  type AuthResponse {
    success: Boolean!
    message: String!
    token: String
  }
`;
