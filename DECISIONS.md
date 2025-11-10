# Architectural and Technology Decisions

This document outlines the key decisions that need to be made for implementing the Bookstore API.

## Already Decided (Per Requirements)

Based on the project requirements, the following technology choices are fixed:

- **Framework:** Express.js
- **Language:** TypeScript
- **Architecture Pattern:** N-layered architecture

## Key Decisions to Make

### 1. Data Storage

**Decision Needed:** How should we persist book data?

**Options:**
- **In-memory storage:** Simple array or Map structure
  - Pros: Quick to implement, no setup required, sufficient for demo/test
  - Cons: Data lost on restart, not production-ready
- **SQL Database:** PostgreSQL, MySQL, SQLite
  - Pros: Structured data, ACID compliance, mature ecosystem
  - Cons: Requires setup, migration management
- **NoSQL Database:** MongoDB
  - Pros: Flexible schema, JSON-like documents
  - Cons: Requires setup, may be overkill for simple CRUD

**Recommendation:** In-memory storage with seed data (sufficient for test scenario)

**✅ Decision Made:** SQLite with better-sqlite3
- Provides data persistence while remaining simple
- No server setup required, just a file (bookstore.db)
- Full SQL capabilities with synchronous API

### 2. N-Layered Architecture Structure

**Decision Needed:** How should we organize the application layers?

**Proposed Layer Structure:**
```
┌─────────────────────┐
│  Controller Layer   │  ← HTTP request/response handling, route handlers
├─────────────────────┤
│   Service Layer     │  ← Business logic, discount calculations
├─────────────────────┤
│  Repository Layer   │  ← Data access, CRUD operations
├─────────────────────┤
│    Model Layer      │  ← TypeScript interfaces, types, DTOs
└─────────────────────┘
```

**Additional Layers:**
- **Middleware Layer:** Validation, error handling, logging
- **Routes Layer:** Route definitions separate from controllers

**Project Structure:**
```
src/
  ├── controllers/      # HTTP handlers
  ├── services/         # Business logic
  ├── repositories/     # Data access
  ├── models/           # TypeScript interfaces/types
  ├── middleware/       # Validation, error handling
  ├── routes/           # Route definitions
  ├── utils/            # Helper functions
  ├── config/           # Configuration
  └── app.ts            # Application entry point
```

**✅ Decision Made:** Approved - 4-layer architecture with separate routes
- Controller → Service → Repository → Model
- Routes separate from controllers for clean separation of concerns

### 3. Validation Approach

**Decision Needed:** How should we validate incoming requests?

**Options:**
- **Manual validation:** Custom validation functions
  - Pros: Full control, no dependencies
  - Cons: Repetitive, error-prone
- **Zod:** TypeScript-first schema validation
  - Pros: Type inference, excellent TypeScript support
  - Cons: Learning curve
- **Joi:** Mature validation library
  - Pros: Well-documented, feature-rich
  - Cons: Less TypeScript-friendly
- **express-validator:** Express-specific validation
  - Pros: Integrated with Express, familiar API
  - Cons: Less type-safe
- **class-validator:** Decorator-based validation
  - Pros: Clean syntax with decorators
  - Cons: Requires classes, additional setup

**Recommendation:** Zod (best TypeScript integration) or express-validator (simpler)

**Validation Location:**
- Validate at controller level or dedicated middleware
- Keep validation separate from business logic

**✅ Decision Made:** Zod
- Excellent TypeScript integration with automatic type inference
- Clean, declarative schema definitions
- Validation can be done in middleware or controller layer

### 4. Error Handling Strategy

**Decision Needed:** How should we handle and format errors?

**Approach:**
- Centralized error handling middleware
- Custom error classes vs. standard Error objects
- Consistent error response format

**Proposed Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Book with ID 123 not found",
    "statusCode": 404
  }
}
```

**Error Types to Handle:**
- Validation errors (400)
- Not found errors (404)
- Internal server errors (500)

**✅ Decision Made:** Centralized error handling with custom error classes
- Custom error classes for different error types (NotFoundError, ValidationError)
- Centralized error handling middleware
- Consistent JSON error response format

### 5. Testing Framework

**Decision Needed:** What testing tools should we use?

**Options:**
- **Jest:** Most popular, batteries-included
  - Pros: Wide adoption, great documentation, built-in mocking
  - Cons: Can be slower
- **Vitest:** Modern, fast alternative to Jest
  - Pros: Very fast, Jest-compatible API
  - Cons: Newer, smaller community
- **Mocha + Chai:** Traditional combination
  - Pros: Flexible, modular
  - Cons: More setup required

**Recommendation:** Jest (most common for TypeScript/Node projects)

**Testing Strategy:**
- Unit tests for service layer (especially discount calculation logic)
- Integration tests for API endpoints (optional)
- Mock repository layer in service tests
- Test error handling and edge cases

**✅ Decision Made:** Jest for unit tests + Supertest for integration tests
- **Jest:** Unit tests for service layer (business logic, discount calculations)
  - Mock repository layer
  - Test edge cases and error handling
- **Supertest:** Integration tests for controllers/endpoints
  - Test actual HTTP behavior
  - Use separate test database or in-memory SQLite

### 6. API Response Format

**Decision Needed:** Should we standardize API responses?

**Proposed Success Response Format:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Or simpler (just return data directly):**
```json
{ ... }
```

**HTTP Status Codes:**
- 200: Successful GET, PUT, PATCH
- 201: Successful POST (created)
- 204: Successful DELETE (no content)
- 400: Bad request (validation error)
- 404: Not found
- 500: Internal server error

**✅ Decision Made:** Direct data return (no wrapper)
- Return data directly in response body
- Use HTTP status codes to indicate success/failure
- Simpler and follows modern REST API conventions
- Error responses still use the structured format from Decision 4

### 7. Book Data Model

**Decision Needed:** What fields should the Book model include?

**Required Fields (from requirements):**
- `id`: number (unique identifier)
- `title`: string
- `author`: string
- `genre`: string
- `price`: number

**Optional Fields to Consider:**
- `isbn`: string (ISBN-13)
- `publishedDate`: Date or string
- `description`: string
- `publisher`: string
- `pageCount`: number
- `stockQuantity`: number
- `coverImage`: string (URL)
- `createdAt`: Date
- `updatedAt`: Date

**Recommendation:** Start with required fields + ISBN, published date, and description

**✅ Decision Made:** Required fields only
- `id`: number (unique identifier, auto-increment)
- `title`: string
- `author`: string
- `genre`: string
- `price`: number (decimal)

### 8. Additional Considerations

#### Request/Response DTOs
- Should we have separate DTOs for requests and responses?
- Helps with validation and data transformation

**✅ Decision Made:** Use separate DTOs
- `CreateBookDTO`: Omits id (title, author, genre, price)
- `UpdateBookDTO`: All fields optional
- `BookResponse`: Complete book including id

#### Logging
- Console logging vs. logging library (Winston, Pino)
- Log levels: error, warn, info, debug

**✅ Decision Made:** Winston
- Structured logging with log levels
- Better than console.log for production-like code

#### Environment Configuration
- Use `.env` file with dotenv
- Configuration for port, database connection, etc.

**✅ Decision Made:** Use .env with dotenv
- Configure PORT, DATABASE_PATH, NODE_ENV
- Keep configuration separate from code

#### CORS
- Will the API be consumed by a frontend?
- Need to configure CORS middleware

**✅ Decision Made:** Enable CORS
- Use cors middleware with permissive settings for demo
- Allows browser-based testing and frontend integration

#### Documentation
- README with setup instructions (required)
- API documentation: Inline comments vs. Swagger/OpenAPI

**✅ Decision Made:** README only
- Setup and run instructions
- API endpoint documentation
- Test instructions
- Keep it simple for demo purposes

## Summary of Final Decisions

All key decisions have been made. Here's the complete technical stack:

1. **Storage:** SQLite with better-sqlite3
2. **Architecture:** Controller → Service → Repository → Model (4-layer, routes separate)
3. **Validation:** Zod with separate DTOs (CreateBookDTO, UpdateBookDTO)
4. **Testing:** Jest (unit tests) + Supertest (integration tests)
5. **Error Handling:** Custom error classes with centralized middleware
6. **Response Format:** Direct data return (no wrapper)
7. **Data Model:** Required fields only (id, title, author, genre, price)
8. **Logging:** Winston
9. **Configuration:** .env with dotenv
10. **CORS:** Enabled with permissive settings
11. **Documentation:** README with setup and API docs

## Next Steps

1. ✅ ~~Review and approve these decisions~~ - COMPLETE
2. Initialize TypeScript/Node.js project
3. Set up project structure (folders)
4. Install dependencies
5. Set up database schema and initialization
6. Implement layers incrementally (models → repository → service → controller → routes)
7. Write tests alongside implementation
8. Create README with setup instructions
