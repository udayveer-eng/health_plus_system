export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate body, query, and params against the schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      // Forward Zod errors to global error handler
      next(error);
    }
  };
};
