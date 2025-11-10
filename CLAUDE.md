# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a RESTful API for a bookstore built with Express and TypeScript. The API provides CRUD operations for books and includes a special discount calculation feature for books by genre.

**Key requirement:** Calculate total discounted price for all books in a specific genre:
- Formula: `total_price - (discount_percentage / 100 * total_price)`
- Endpoint: `GET /books/discounted-price?genre={genre}&discount={discount_percentage}`

## Architecture

This project uses a strict **4-layer n-tier architecture** with clear separation of concerns:

```
Request Flow:
Routes → Controllers → Services → Repositories → Database

┌─────────────────────┐
│  Routes Layer       │  Define endpoints, connect to controllers
├─────────────────────┤
│  Controller Layer   │  HTTP handling (req/res), call services
├─────────────────────┤
│  Service Layer      │  Business logic, discount calculations
├─────────────────────┤
│  Repository Layer   │  Data access, SQL queries (better-sqlite3)
└─────────────────────┘
         ↓
    SQLite Database
```

**Layer responsibilities:**
- **Routes** (`src/routes/`): Define Express routes only, delegate to controllers
- **Controllers** (`src/controllers/`): Handle HTTP requests/responses, validation, call services
- **Services** (`src/services/`): Business logic, calculations (especially discount logic), orchestration
- **Repositories** (`src/repositories/`): Database operations, SQL queries, data mapping
- **Models** (`src/models/`): TypeScript interfaces and DTOs
- **Middleware** (`src/middleware/`): Error handling, validation middleware
- **Config** (`src/config/`): Database initialization, environment configuration

**Cross-cutting concerns:**
- **Validation:** Use Zod schemas in middleware or controllers (before calling services)
- **Error handling:** Custom error classes with centralized error middleware
- **Logging:** Winston for structured logging

## Technical Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** SQLite with better-sqlite3 (synchronous API)
- **Validation:** Zod (TypeScript-first schema validation)
- **Testing:** Jest (unit tests) + Supertest (integration tests)
- **Logging:** Winston
- **Environment:** dotenv for configuration

## Data Model

Book entity (required fields only):
```typescript
{
  id: number        // Auto-increment primary key
  title: string
  author: string
  genre: string
  price: number     // Decimal/float
}
```

**DTOs:**
- `CreateBookDTO`: Omits id (for POST requests)
- `UpdateBookDTO`: All fields optional (for PUT/PATCH requests)
- `BookResponse`: Complete book including id

## API Endpoints

- `POST /books` - Create book (201 on success)
- `GET /books/:id` - Get book by ID (404 if not found)
- `PUT /books/:id` - Update book (200 on success, 404 if not found)
- `DELETE /books/:id` - Delete book (204 on success, 404 if not found)
- `GET /books?genre={genre}` - Filter books by genre
- `GET /books/discounted-price?genre={genre}&discount={percentage}` - Calculate discounted total

**Response format:**
- Success: Return data directly (no wrapper)
- Errors: Structured format with `success: false`, `error: { code, message, statusCode }`

**HTTP Status Codes:**
- 200: GET, PUT, PATCH success
- 201: POST success (created)
- 204: DELETE success (no content)
- 400: Validation error
- 404: Not found
- 500: Internal server error

## Testing Strategy

**Unit tests (Jest):**
- Test service layer business logic in isolation
- Mock repository layer
- Focus on discount calculation logic and edge cases
- Test error handling

**Integration tests (Supertest):**
- Test actual HTTP endpoints
- Use separate test database or in-memory SQLite
- Test all CRUD operations and discount endpoint
- Verify proper status codes and response formats

## Database Setup

- **File:** `bookstore.db` (SQLite file, created automatically)
- **Table:** `books` with columns: id (INTEGER PRIMARY KEY AUTOINCREMENT), title (TEXT), author (TEXT), genre (TEXT), price (REAL)
- **Initialization:** Database schema and seed data setup in `src/config/database.ts`
- **Access:** Use better-sqlite3 synchronous API (no promises/async needed)

## Environment Configuration

Use `.env` file with:
- `PORT` - Server port (default: 3000)
- `DATABASE_PATH` - Path to SQLite database file (default: ./bookstore.db)
- `NODE_ENV` - Environment (development/test/production)

## Important Implementation Notes

1. **Layer isolation:** Services should NEVER directly access the database - always go through repositories
2. **Error handling:** Throw custom error classes (NotFoundError, ValidationError) in services/repositories, catch in centralized error middleware
3. **Validation:** Use Zod schemas to validate incoming requests before reaching service layer
4. **DTOs:** Controllers should map between DTOs and domain models
5. **Discount calculation:** Implement in service layer, must handle edge cases (empty genre, no books found)
6. **Testing:** Repository layer should be mocked in service unit tests
7. **CORS:** Enabled with permissive settings for demo purposes

## Code Style Preferences

- **Line length:** Maximum line length is 120 characters.
- **Comments:** All comments must end with periods.
- **Function docstrings:** Add docstrings for functions that are more than a couple of lines long.
- **Docstring parameters:** Do not specify parameter and return types in docstrings unless the function is complex and types are not obvious (TypeScript types already provide this information).

## Project Structure Reference

See `DECISIONS.md` for detailed architectural decisions and rationale.
See `REQUIREMENTS.md` for complete API requirements and specifications.
See `IMPLEMENTATION_PROGRESS.md` for current implementation status.
