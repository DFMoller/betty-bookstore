/**
 * Book entity representing a book in the database.
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  price: number;
}

/**
 * DTO for creating a new book (omits id as it's auto-generated).
 */
export interface CreateBookDTO {
  title: string;
  author: string;
  genre: string;
  price: number;
}

/**
 * DTO for updating an existing book (all fields optional).
 */
export interface UpdateBookDTO {
  title?: string;
  author?: string;
  genre?: string;
  price?: number;
}
