
/**
 * Format a price value to a localized currency string
 */
export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

/**
 * Format a date string to a localized date
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
