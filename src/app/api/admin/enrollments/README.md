# Admin Enrollments API

This API endpoint allows an administrator to manually enroll a teacher in a specific course.

## `POST /api/admin/enrollments`

Enrolls a teacher in a course.

### Request Body

```json
{
  "teacherClerkId": "string", // The Clerk ID of the teacher to enroll
  "courseId": "string"      // The ID of the course to enroll the teacher in
}
```

### Authentication

This endpoint requires an authenticated user with an `ADMIN` role.

### Responses

#### `201 Created`

Successfully enrolled the teacher in the course.

```json
{
  "id": "uuid",
  "userId": "uuid",
  "courseId": "string",
  "createdAt": "timestamp"
}
```

#### `400 Bad Request`

Missing `teacherClerkId` or `courseId` in the request body.

```json
{
  "message": "Missing teacherClerkId or courseId"
}
```

#### `401 Unauthorized`

No authenticated user found.

#### `403 Forbidden`

The authenticated user does not have `ADMIN` privileges.

#### `404 Not Found`

The specified teacher user was not found.

```json
{
  "message": "Teacher user not found"
}
```

#### `409 Conflict`

The teacher is already enrolled in the specified course.

```json
{
  "message": "Teacher already enrolled in this course"
}
```

#### `500 Internal Error`

An unexpected error occurred on the server.

```json
{
  "message": "Internal Error"
}
```
