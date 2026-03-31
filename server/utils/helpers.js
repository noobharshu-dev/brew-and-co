/**
 * Create a custom error with a status code.
 * Usage: throw createError('Not found', 404)
 */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// To seed test menu items, POST to /api/menu with x-admin-key header
// Example body: { name: "Flat White", price: 4.5, category: "Coffee", description: "...", image: "..." }

module.exports = { createError };
