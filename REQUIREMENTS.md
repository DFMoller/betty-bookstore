# Bookstore API Requirements

## Objective

Implement a RESTful API for a bookstore that allows users to perform CRUD operations on books and implement a complex logical operation for managing book discounts.

## Technical Stack

- **Framework:** Express
- **Language:** TypeScript
- **Architecture:** N-layered architecture

## Tasks

### Task 1: CRUD Operations for Books

Implement the following endpoints for managing books:

#### 1. Create Book
- **Endpoint:** `POST /books`
- **Description:** Add a new book to the inventory
- **Request Body:** Book details (title, author, genre, price, etc.)

#### 2. Read Book
- **Endpoint:** `GET /books/:id`
- **Description:** Retrieve details of a book by its ID
- **Response:** Single book object with all details

#### 3. Update Book
- **Endpoint:** `PUT /books/:id` or `PATCH /books/:id`
- **Description:** Update details of an existing book
- **Request Body:** Updated book details

#### 4. Delete Book
- **Endpoint:** `DELETE /books/:id`
- **Description:** Delete a book from the inventory

### Task 2: Calculate Discounted Price for a Genre

#### Endpoint
```
GET /books/discounted-price?genre={genre_name}&discount={discount_percentage}
```

#### Description
Calculate the total discounted price for all books in a specific genre based on a given discount percentage.

#### Query Parameters
- `genre` (string, required): The genre name (e.g., "Fiction")
- `discount` (number, required): The discount percentage (e.g., 10 for 10%)

#### Example Request
```
GET /books?genre=Fiction
```

#### Example Response - List Books by Genre
```json
[
  {
    "id": 1,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "genre": "Fiction"
  },
  {
    "id": 2,
    "title": "1984",
    "author": "George Orwell",
    "genre": "Fiction"
  }
]
```

#### Example Request - Calculate Discounted Price
```
GET /books/discounted-price?genre=Fiction&discount=10
```

#### Example Response - Discounted Price Calculation
```json
{
  "genre": "Fiction",
  "discount_percentage": 10,
  "total_discounted_price": 112.50
}
```

#### Calculation Logic
- Sum all book prices in the specified genre
- Apply the discount percentage to the total
- Formula: `total_price - (discount_percentage / 100 * total_price)`

#### Calculation Example
- Two books in "Fiction" genre: $50 and $75
- Discount percentage: 10%
- Total original price: $50 + $75 = $125
- Discount amount: 10% of $125 = $12.50
- Total discounted price: $125 - $12.50 = $112.50

## Additional Requirements

### Input Validation and Error Handling
- Validate all input data (required fields, data types, ranges)
- Handle invalid book IDs (404 errors)
- Handle missing or invalid query parameters
- Return appropriate HTTP status codes
- Provide meaningful error messages

### Unit Tests
- Write unit tests to ensure correctness of the discount calculation logic
- Test edge cases (empty genre, invalid discount percentages, etc.)
- Test all CRUD operations
- Ensure proper error handling is tested

### Documentation
- Create a README.md file with:
  - Installation instructions
  - How to run the API
  - API endpoint documentation
  - Example requests and responses
  - How to run tests

## Book Data Model

At minimum, each book should contain:
- `id`: Unique identifier (number)
- `title`: Book title (string)
- `author`: Book author (string)
- `genre`: Book genre (string)
- `price`: Book price (number)

Additional fields can be added as needed.

## Submission

- Place code in a git repository
- Share repository with: james@octoco.ltd
- Include a README with sufficient instructions to get the API running
