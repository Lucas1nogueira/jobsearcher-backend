import { gql } from "apollo-server-express";

export const mutations = gql`
  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
    updateUser(id: ID!, data: UpdateUserInput!): User!
    deleteUser(id: ID!): DeleteResponse!

    createJob(
      title: String!
      url: String!
      description: String!
      company: String!
      companyURL: String!
      location: String!
    ): Job!
    updateJob(id: ID!, data: UpdateJobInput!): Job!
    deleteJob(id: ID!): DeleteResponse!

    createApplication(userId: ID!, jobId: ID!): Application!
    deleteApplication(id: ID!): DeleteResponse!
  }
`;
