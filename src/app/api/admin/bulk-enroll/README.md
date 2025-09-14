# Admin Bulk Enrollment API

This API endpoint allows an administrator to enroll multiple teachers into a single course simultaneously.

## `POST /api/admin/bulk-enroll`

Enrolls multiple teachers in a course.

### Request Body

```json
{
  "enrollments": [
    {
      "teacherClerkId": "string", // The Clerk ID of the teacher to enroll
      "courseId": "string"      // The ID of the course to enroll the teacher in
    }
    // ... more enrollment entries
  ]
}
```

### Authentication

This endpoint requires an authenticated user with an `ADMIN` role.

### Responses

#### `200 OK`

Returns a summary of successful and failed enrollments.

```json
{
  "successfulEnrollments": [
    {
      "id": "uuid",
      "userId": "uuid",
      "courseId": "string",
      "createdAt": "timestamp"
    }
  ],
  "failedEnrollments": [
    {
      "teacherClerkId": "string",
      "courseId": "string",
      "reason": "string" // e.g., "Teacher user not found", "Teacher already enrolled in this course"
    }
  ]
}
```

#### `400 Bad Request`

Invalid or empty enrollment data in the request body.

```json
{
  "message": "Invalid or empty enrollment data"
}
```

#### `401 Unauthorized`

No authenticated user found.

#### `403 Forbidden`

The authenticated user does not have `ADMIN` privileges.

#### `500 Internal Error`

An unexpected error occurred on the server.

```json
{
  "message": "Internal Error"
}
```
