# Admin Users API

This API endpoint allows an administrator to retrieve a list of all users in the system.

## `GET /api/admin/users`

Retrieves a list of all users.

### Authentication

This endpoint requires an authenticated user with an `ADMIN` role.

### Responses

#### `200 OK`

Successfully retrieved the list of users.

```json
[
  {
    "id": "uuid",        // Internal Supabase user ID
    "clerkId": "string",   // Clerk user ID
    "email": "string",
    "role": "string"
  }
  // ... more users
]
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
