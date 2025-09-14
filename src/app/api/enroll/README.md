# Self-Enrollment API

This API endpoint allows an authenticated user (e.g., a teacher) to enroll themselves in an available course.

## `POST /api/enroll`

Enrolls the authenticated user in a specified course.

### Request Body

```json
{
  "courseId": "string"      // The ID of the course to enroll in
}
```

### Authentication

This endpoint requires an authenticated user.

### Responses

#### `201 Created`

Successfully enrolled the user in the course.

```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "string",
  "createdAt": "timestamp"
}
```

#### `400 Bad Request`

Missing `courseId` in the request body.

```json
{
  "message": "Missing courseId"
}
```

#### `401 Unauthorized`

No authenticated user found.

#### `404 Not Found`

The authenticated user was not found in the database.

```json
{
  "message": "User not found"
}
```

#### `409 Conflict`

The user is already enrolled in the specified course.

```json
{
  "message": "Already enrolled in this course"
}
```

#### `500 Internal Error`

An unexpected error occurred on the server.

```json
{
  "message": "Internal Error"
}
```
