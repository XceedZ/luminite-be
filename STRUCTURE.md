# Project Structure

## Folder Structure

```
src/
├── auth/              # Auth utilities (password hashing/verification)
│   └── index.ts
├── controllers/       # Controllers (business logic)
│   └── auth.controller.ts
├── dao/               # Data Access Object (database operations)
│   └── users.ts
├── db/                # Database configuration
│   ├── index.ts       # Database connection
│   └── schema.ts      # Drizzle schema definitions
├── constants.ts       # API constants (STATUS, MESSAGES, ERROR_MESSAGES)
└── index.ts          # Main Elysia app & routes
```

## Separation of Concerns

### 1. DAO (Data Access Object) - `src/dao/`
**Purpose**: Handle all database operations

**Files**:
- `users.ts` - User database operations

**Functions**:
- `findUserByEmail(email: string)`
- `findUserByUsername(username: string)`
- `findUserByEmailOrUsername(identifier: string)`
- `createUser(data: {...})`
- `getAllActiveUsers()`
- `findUserById(userId: number)`

**Rules**:
- ✅ Only database queries
- ✅ No business logic
- ✅ No password hashing
- ✅ Return raw data from database

### 2. Controllers - `src/controllers/`
**Purpose**: Handle business logic and orchestration

**Files**:
- `auth.controller.ts` - Authentication business logic

**Functions**:
- `registerUser(data: {...})` - Register new user
- `loginUser(data: {...})` - Login user

**Rules**:
- ✅ Use DAO functions for database access
- ✅ Use auth utilities for password operations
- ✅ Handle validation and business rules
- ✅ Return structured responses with status/message/data
- ✅ No direct database queries

### 3. Auth Utilities - `src/auth/`
**Purpose**: Password hashing and verification

**Functions**:
- `hashPassword(password: string)`
- `verifyPassword(password: string, hash: string)`

**Rules**:
- ✅ Only password-related utilities
- ✅ No database operations
- ✅ No business logic

### 4. Routes - `src/index.ts`
**Purpose**: Define API endpoints and handle HTTP requests/responses

**Rules**:
- ✅ Use controllers for business logic
- ✅ Handle HTTP status codes
- ✅ Define request/response schemas
- ✅ JWT token generation and cookie management
- ✅ No direct DAO calls (use controllers instead)

## Example Flow

### Register Flow:
```
Request → index.ts (route) 
  → auth.controller.registerUser() 
    → dao.users.findUserByEmailOrUsername() (check duplicate)
    → dao.users.findUserByEmail() (check duplicate)
    → auth.hashPassword() (hash password)
    → dao.users.createUser() (save to DB)
  → Return response
```

### Login Flow:
```
Request → index.ts (route)
  → auth.controller.loginUser()
    → dao.users.findUserByEmailOrUsername() (find user)
    → auth.verifyPassword() (verify password)
  → Generate JWT token
  → Set cookie
  → Return response
```

## Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Easy to mock DAO and test controllers
3. **Maintainability**: Changes in database structure only affect DAO
4. **Reusability**: DAO functions can be reused across controllers
5. **Scalability**: Easy to add new controllers and DAOs

## Adding New Features

### Example: Add User Profile Update

1. **Add DAO function** (`src/dao/users.ts`):
```typescript
export const updateUser = async (userId: number, data: {...}) => {
  // Database update logic
};
```

2. **Add Controller** (`src/controllers/user.controller.ts`):
```typescript
export const updateUserProfile = async (userId: number, data: {...}) => {
  // Business logic
  // Validation
  // Call DAO
  // Return response
};
```

3. **Add Route** (`src/index.ts`):
```typescript
.put('/users/:id', async ({ params, body, set }) => {
  const result = await updateUserProfile(params.id, body);
  // Handle response
})
```

