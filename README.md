# Test-Pro: Full Stack Application

. The backend is built with NestJS using Fastify as the HTTP framework, PostgreSQL as the database, and Redis for caching. The project uses TypeORM for database mappings, and Swagger is included for providing APIs to the frontend.

## Tables

- **Books**: Manage book details such as title, description, and price.
- **Bookstores**: Manage bookstores' information such as title, country, and city.
- **Users,user_verifications**: Manage user accounts with permissions.
- **Permissions,permission_items**: Includes permissions logic.
- **Inventory**: Track the quantity of books available in bookstores.

## Tech Stack

- **Backend**: NestJS, Fastify
- **Database**: PostgreSQL
- **Caching**: Redis
- **ORM**: TypeORM
- **API Documentation**: Swagger
- **Authentication**: Session authorization logic
- **Code Formatting**: Prettier, ESLint
- **Commit Formatting**: Commitizen with husky

## Setup Instructions

### 1. Clone the Repository

Clone the repository to your local machine:

```bash
git clone git@github.com:cibilex/iyzads-task.git
cd iyzads-task
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Docker containers

- you can set up PostgreSQL and Redis containers using the docker-compose.yml file in the project directory:

```bash
docker compose up -d
```

### 3.Set up your environment variables and running the project:

1. Create a .env.dev file for development configuration : `npm run start:dev`
2. Create a .env.prod file for production configuration: `npm run start:prod`
   he project uses the `@nestjs/config ` library, which automatically loads environment variables based on the NODE_ENV variable.

# Notes

1. The application automatically creates an Admin user on startup if one does not exist. The Admin credentials are read from the environment files.


### Frontend Link
[link](https://iiyzads-task.netlify.app): https://iiyzads-task.netlify.app          
frontend github [link](https://github.com/cibilex/iyzads-task-front) : https://github.com/cibilex/iyzads-task-front
