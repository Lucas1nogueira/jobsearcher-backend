import { gql } from "apollo-server-express";

export const queries = gql`
  type Query {
    users: [User!]!
    user(id: ID!): User

    jobs(keyword: String, location: String): [Job!]!
    job(id: ID!): Job

    applications: [Application!]!
    application(id: ID!): Application

    applicationsByUser: [Application!]!
  }
`;
