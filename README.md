<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Backend API Documentation

<p align="center">Comprehensive documentation for the backend API built using <strong>NestJS</strong>. This API implements <strong>JWT-based authentication</strong> and provides secure and scalable solutions for user management.</p>

---

## Base URL

All endpoints are prefixed with the base URL:

```
http://localhost:3000
```

---

## Authentication Endpoints

### 1. Sign Up

- **Description**: Allows a new user to create an account.
- **Endpoint**: `POST /auth/signup`
- **Headers**: None

- **Request Body**:

  ```json
  {
    "email": "string",
    "name": "string",
    "password": "string"
  }
  ```

  - `email`: The user's email address (required).
  - `name`: The user's name (required).
  - `password`: The user's password (required, must meet complexity requirements).

- **Response**:
  - **201 Created**:
    ```json
    {
      "email": "string",
      "name": "string"
    }
    ```
  - **400 Bad Request**:
    ```json
    {
      "statusCode": 400,
      "message": "Email is already taken."
    }
    ```

### 2. Sign In

- **Description**: Authenticates a user and returns a JWT token.
- **Endpoint**: `POST /auth/signin`
- **Headers**: None

- **Request Body**:

  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

  - `email`: The user's email address (required).
  - `password`: The user's password (required).

- **Response**:
  - **200 OK**:
    ```json
    {
      "token": "string"
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "statusCode": 401,
      "message": "Invalid credentials."
    }
    ```

### 3. Get Profile

- **Description**: Retrieves the authenticated user's profile information.
- **Endpoint**: `GET /auth/profile`

- **Headers**:

  - `Authorization`: `Bearer <JWT>` (required)

- **Response**:
  - **200 OK**:
    ```json
    {
      "email": "string",
      "name": "string"
    }
    ```
  - **401 Unauthorized**:
    ```json
    {
      "statusCode": 401,
      "message": "Unauthorized"
    }
    ```

---

## Common Errors

### Error Format

All errors follow this format:

```json
{
  "statusCode": <number>,
  "message": "string"
}
```

### Examples

- **400 Bad Request**:

  ```json
  {
    "statusCode": 400,
    "message": "Validation failed."
  }
  ```

- **401 Unauthorized**:
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized"
  }
  ```

---

## Authentication Flow

1. A user signs up using the `POST /auth/signup` endpoint.
2. The user signs in using the `POST /auth/signin` endpoint to receive a JWT token.
3. The user includes the JWT token in the `Authorization` header to access protected endpoints like `GET /auth/profile`.

---

## Security Best Practices

- Always use HTTPS in production.
- Store the JWT secret securely (e.g., in AWS Secrets Manager).
- Implement rate limiting to prevent brute force attacks.
- Enforce strong password policies during user sign-up.

---

## Testing the API

Use **Postman** or **cURL** to test the API:

### Example: Sign In with Postman

- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/signin`
- **Body** (raw JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Headers**:
  ```
  Content-Type: application/json
  ```

### Example: Fetch Profile with cURL

```bash
curl -X GET http://localhost:3000/auth/profile \
-H "Authorization: Bearer <JWT>"
```

---

## Swagger Documentation

The API includes Swagger documentation for interactive testing and exploration.

### Access Swagger UI

1. Run the backend application.
2. Navigate to the following URL in your browser:

   ```
   http://localhost:3000/api
   ```

### Features

- View all available endpoints.
- See detailed request and response formats.
- Authenticate directly in the Swagger UI using JWT.

---

## Project Setup

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
# Development
npm run start

# Watch Mode
npm run start:dev

# Production Mode
npm run start:prod
```

### Run Tests

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Test Coverage
npm run test:cov
```

---

## Changelog

- **v1.0**: Initial API implementation with authentication endpoints.

For further questions or issues, contact the backend development team.
