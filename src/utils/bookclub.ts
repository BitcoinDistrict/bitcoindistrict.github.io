import { bookClubBooks, type BookClubBook } from '~/data/bookclub';

/**
 * Gets the current book being read by the book club.
 * Returns the book for the next upcoming meeting date:
 * - If today is before a book's meeting date, that's the book we're preparing to discuss
 * - If today is on or after a book's meeting date, we look for the next book after that
 * - If no future meetings, return the most recent book
 */
export function getCurrentBook(): BookClubBook {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

  // Filter books that have dates and sort by date
  const booksWithDates = bookClubBooks
    .filter(book => book.date !== null)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  
  if (booksWithDates.length === 0) {
    return bookClubBooks[0]; // Fallback
  }

  // Find the next book meeting
  for (let i = 0; i < booksWithDates.length; i++) {
    const bookDate = new Date(booksWithDates[i].date!);
    
    // If this book's meeting date is today or in the future, this is what we're reading for
    if (bookDate >= today) {
      return booksWithDates[i];
    }
  }

  // If no future meetings, return the most recent book
  return booksWithDates[booksWithDates.length - 1];
}

/**
 * Gets a formatted date string for display purposes
 */
export function getFormattedBookDate(book: BookClubBook): string {
  if (!book.date) return '';
  
  const date = new Date(book.date);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}