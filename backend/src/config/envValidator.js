const validateEnv = () => {
  const requiredVariables = ["PORT", "MONGO_URI", "JWT_SECRET"];
  const missingVariables = [];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      missingVariables.push(variable);
    }
  }

  if (missingVariables.length > 0) {
    console.error(
      `\x1b[31m[ERROR] Missing required environment variables: ${missingVariables.join(", ")}\x1b[0m`
    );
    console.error("Please check your .env file and try again.");
    process.exit(1);
  }
};

export default validateEnv;
