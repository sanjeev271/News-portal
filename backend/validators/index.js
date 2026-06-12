function validateBody(required = [], optional = {}) {
  return (req, res, next) => {
    const errors = [];

    for (const field of required) {
      const val = req.body[field];
      if (val === undefined || val === null || (typeof val === "string" && !val.trim())) {
        errors.push(`${field} is required`);
      }
    }

    for (const [field, rules] of Object.entries(optional)) {
      const val = req.body[field];
      if (val === undefined || val === null) continue;

      if (rules.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors.push(`${field} must be a valid email`);
      }
      if (rules.minLength && String(val).length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && String(val).length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
      if (rules.enum && !rules.enum.includes(val)) {
        errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: "Validation failed", errors });
    }
    next();
  };
}

module.exports = { validateBody };
