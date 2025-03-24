# jobsearcher-backend

This is a job management server that integrates with the Piloterr API to fetch job listings from LinkedIn. It provides user management and application tracking functionalities.

## Installation

```sh
git clone <repository-url>
cd <project-directory>
npm install
```

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```ini
# Postgres credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=job_management
POSTGRES_PORT=5432

# Connection URLs
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/job_management

# Piloterr API
PILOTERR_API_SEARCH_URL=https://piloterr.com/api/v2/linkedin/job/search
PILOTERR_API_JOB_INFO_URL=https://piloterr.com/api/v2/linkedin/job/info
PILOTERR_API_KEY=your-piloterr-api-key

# JWT secret key
JWT_SECRET=your-secret-key
```

## Running the Server

Start the Docker containers before running the server:

```sh
docker-compose up -d
```

Then, start the server:

```sh
npm run dev
```

The server runs at: [http://localhost:3000/](http://localhost:3000/)

GraphQL endpoint: [http://localhost:3000/graphql](http://localhost:3000/graphql)

## REST API Endpoints

### Authentication

- `POST /signup` - User registration
- `POST /login` - User authentication

### User Management

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user (requires authentication)
- `DELETE /users/:id` - Delete user (requires authentication)

### Job Management

- `POST /jobs` - Create a job
- `GET /jobs` - Get all jobs
- `GET /jobs/:id` - Get job by ID
- `PATCH /jobs/:id` - Update job
- `DELETE /jobs/:id` - Delete job

### Application Management

- `POST /applications` - Create an application (requires authentication)
- `GET /applications` - Get all applications
- `GET /applications/:id` - Get application by ID
- `GET /applicationsByUser` - Get applications for the authenticated user
- `DELETE /applications/:id` - Delete application (requires authentication)

## GraphQL API

### Queries

```graphql
users: [User!]!
user(id: ID!): User

jobs(keyword: String, location: String): [Job!]!
job(id: ID!): Job

applications: [Application!]!
application(id: ID!): Application

applicationsByUser: [Application!]!
```

### Mutations

```graphql
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
```
