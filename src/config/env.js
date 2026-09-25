import "dotenv/config";

function getEnv(name, options = {}) {
  const {
    required = true,
    defaultValue = undefined,
  } = options;

  const value = process.env[name];

  if (
    (value === undefined || value === "") &&
    required
  ) {
    throw new Error(
      `Missing required environment variable: ${name}`
    );
  }

  return value ?? defaultValue;
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", {
    required: false,
    defaultValue: "development",
  }),

  PORT: Number(
    getEnv("PORT", {
      required: false,
      defaultValue: "5001",
    })
  ),

  DATABASE_URL: getEnv("DATABASE_URL"),

  CLIENT_URL: getEnv("CLIENT_URL", {
    required: false,
    defaultValue: "http://localhost:5173",
  }),

  ADMIN_REGISTRATION_CODE: getEnv(
    "ADMIN_REGISTRATION_CODE"
  ),

  BREVO_API_KEY: getEnv("BREVO_API_KEY"),

  BREVO_SENDER_EMAIL: getEnv(
    "BREVO_SENDER_EMAIL"
  ),

  BREVO_SENDER_NAME: getEnv(
    "BREVO_SENDER_NAME",
    {
      required: false,
      defaultValue: "BYTECODEE",
    }
  ),

  isProduction:
    process.env.NODE_ENV === "production",
};