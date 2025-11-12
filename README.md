# Bookstore API

RESTful API for a bookstore built with Express and TypeScript. Provides CRUD operations for books and discount calculation by genre.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

```bash
npm install
```

## Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration:
```
PORT=3000
DATABASE_PATH=./bookstore.db
NODE_ENV=development
```

## Running the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

The API will be available at `http://localhost:3000`.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Create Book
```http
POST /books
Content-Type: application/json

{
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "genre": "Fiction",
  "price": 12.99
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "genre": "Fiction",
  "price": 12.99
}
```

### Get Book by ID
```http
GET /books/:id
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "genre": "Fiction",
  "price": 12.99
}
```

### Get All Books
```http
GET /books
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "genre": "Fiction",
    "price": 12.99
  }
]
```

### Filter Books by Genre
```http
GET /books?genre=Fiction
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "genre": "Fiction",
    "price": 12.99
  }
]
```

### Update Book
```http
PUT /books/:id
Content-Type: application/json

{
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "genre": "Classic Fiction",
  "price": 14.99
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "To Kill a Mockingbird",
  "author": "Harper Lee",
  "genre": "Classic Fiction",
  "price": 14.99
}
```

### Delete Book
```http
DELETE /books/:id
```

**Response:** `204 No Content`

### Calculate Discounted Price by Genre
```http
GET /books/discounted-price?genre=Fiction&discount=10
```

**Response:** `200 OK`
```json
{
  "genre": "Fiction",
  "discount_percentage": 10,
  "total_discounted_price": 112.50
}
```

**Calculation:** For books with total price $125, a 10% discount results in $125 - ($125 × 0.10) = $112.50

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Book with ID 999 not found",
    "statusCode": 404
  }
}
```

## Architecture

The project uses a 4-layer architecture:
- **Routes:** Define endpoints
- **Controllers:** Handle HTTP requests/responses
- **Services:** Business logic and discount calculations
- **Repositories:** Database operations

## Tech Stack

- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** SQLite (better-sqlite3)
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **Logging:** Winston
