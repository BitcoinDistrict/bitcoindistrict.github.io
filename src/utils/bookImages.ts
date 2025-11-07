// Dynamically import all book cover images using Vite's import.meta.glob()
// This automatically imports all image files in the books directory
const bookImages = import.meta.glob('~/assets/images/books/*.{jpg,jpeg,png,webp}', { 
  eager: true,
  import: 'default'
}) as Record<string, any>;

// Create a mapping from the tilde-prefixed paths to the imported images
export const bookImageMap: Record<string, any> = {};

// Convert the absolute paths from import.meta.glob to tilde-prefixed paths
Object.keys(bookImages).forEach(path => {
  // Convert '/src/assets/images/books/filename.jpg' to '~/assets/images/books/filename.jpg'
  const tildeKey = path.replace('/src/', '~/');
  bookImageMap[tildeKey] = bookImages[path];
});

// Helper function to get the imported image from a path string
export function getBookImage(imagePath: string) {
  const image = bookImageMap[imagePath];
  
  if (!image) {
    console.warn(`Book image not found: ${imagePath}`);
    console.warn('Available images:', Object.keys(bookImageMap));
  }
  
  return image;
}

// Export the available image paths for debugging
export function getAvailableBookImages(): string[] {
  return Object.keys(bookImageMap);
}