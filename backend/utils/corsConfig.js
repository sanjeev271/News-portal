function parseOrigins(value) {
  if (!value) return [];
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function getAllowedOrigins() {
  const fromEnv = parseOrigins(process.env.CORS_ORIGINS);
  if (fromEnv.length) return fromEnv;

  if (process.env.NODE_ENV !== "production") {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "http://127.0.0.1:4173",
    ];
  }

  return [];
}

function getCorsOptions() {
  const origins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

function getSocketCorsOptions() {
  const origins = getAllowedOrigins();
  return {
    origin: origins.length ? origins : false,
    methods: ["GET", "POST"],
    credentials: true,
  };
}

module.exports = { getAllowedOrigins, getCorsOptions, getSocketCorsOptions };
