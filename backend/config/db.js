const path = require("path");
const mysql = require("mysql2");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DEFAULT_DB_PORT = 3306;

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const parseDatabaseUrl = (connectionString) => {
  const parsed = new URL(connectionString);

  if (!["mysql:", "mysql2:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported database protocol: ${parsed.protocol}`);
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\//, ""));

  return {
    host: parsed.hostname || "127.0.0.1",
    port: parsed.port ? parseNumber(parsed.port, DEFAULT_DB_PORT) : DEFAULT_DB_PORT,
    user: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    database: databaseName || undefined,
    socketPath: parsed.searchParams.get("socketPath") || undefined,
  };
};

const buildSslConfig = () => {
  const shouldUseSsl = parseBoolean(process.env.DB_SSL, false);

  if (!shouldUseSsl) {
    return undefined;
  }

  return {
    rejectUnauthorized: parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, false),
  };
};

const formatDbTarget = (config) => {
  if (config.socketPath) {
    return `socket:${config.socketPath}/${config.database || "(no-db)"}`;
  }

  return `${config.host || "127.0.0.1"}:${config.port || DEFAULT_DB_PORT}/${config.database || "(no-db)"}`;
};

const getDbConfig = () => {
  const databaseUrl =
    process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL;

  const baseConfig = databaseUrl
    ? parseDatabaseUrl(databaseUrl)
    : {
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseNumber(process.env.DB_PORT, DEFAULT_DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        socketPath: process.env.DB_SOCKET_PATH || undefined,
      };

  const ssl = buildSslConfig();

  return {
    ...baseConfig,
    waitForConnections: true,
    connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, 25),
    queueLimit: 0,
    connectTimeout: parseNumber(process.env.DB_CONNECT_TIMEOUT, 10000),
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    dateStrings: true,
    timezone: "Z",
    ...(ssl ? { ssl } : {}),
  };
};

const dbConfig = getDbConfig();
console.log(
  `[db] target=${formatDbTarget(dbConfig)} ssl=${dbConfig.ssl ? "on" : "off"} source=${
    process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.DB_URL ? "url" : "env"
  }`,
);

const pool = mysql.createPool(dbConfig);

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
    console.log("Reconnecting to database...");
  }
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }

  console.log("Database connection established.");
  connection.release();
});

module.exports = pool.promise();
