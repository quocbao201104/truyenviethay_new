const Redis = require("ioredis");
require("dotenv").config();
const logger = require("./logger");

const DEFAULT_REDIS_PORT = 6379;

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

const parseRedisUrl = (connectionString) => {
  const parsed = new URL(connectionString);

  if (!["redis:", "rediss:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported Redis protocol: ${parsed.protocol}`);
  }

  const rawDb = parsed.pathname.replace(/^\//, "");
  const db = rawDb ? parseNumber(rawDb, 0) : undefined;

  return {
    host: parsed.hostname || "127.0.0.1",
    port: parsed.port ? parseNumber(parsed.port, DEFAULT_REDIS_PORT) : DEFAULT_REDIS_PORT,
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    db,
    ...(parsed.protocol === "rediss:" ? { tls: {} } : {}),
  };
};

const getRedisConnectionConfig = () => {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return parseRedisUrl(redisUrl);
  }

  if (!process.env.REDIS_HOST) {
    throw new Error(
      "Redis configuration is missing. Set REDIS_URL or REDIS_HOST/REDIS_PORT in backend/.env."
    );
  }

  const tlsEnabled = parseBoolean(process.env.REDIS_TLS, false);

  return {
    host: process.env.REDIS_HOST,
    port: parseNumber(process.env.REDIS_PORT, DEFAULT_REDIS_PORT),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseNumber(process.env.REDIS_DB, 0),
    ...(tlsEnabled ? { tls: {} } : {}),
  };
};

const buildRedisOptions = (options = {}) => {
  const {
    clientLabel = "default",
    maxRetriesPerRequest,
    commandTimeout,
    enableOfflineQueue,
    ...restOptions
  } = options;

  return {
    ...getRedisConnectionConfig(),
    maxRetriesPerRequest:
      maxRetriesPerRequest !== undefined ? maxRetriesPerRequest : 1,
    commandTimeout: commandTimeout !== undefined ? commandTimeout : 10000,
    enableOfflineQueue:
      enableOfflineQueue !== undefined ? enableOfflineQueue : true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    ...restOptions,
    clientLabel,
  };
};

const createRedisClient = (options = {}) => {
  const redisOptions = buildRedisOptions(options);
  const { clientLabel, ...connectionOptions } = redisOptions;

  const client = new Redis(connectionOptions);

  client.on("connect", () => {
    logger.info(`Redis connected (${clientLabel})`);
  });

  client.on("error", (err) => {
    logger.error(`Redis connection error (${clientLabel}): ${err.message}`);
  });

  return client;
};

const redis = createRedisClient();

redis.createRedisClient = createRedisClient;

module.exports = redis;
module.exports.createRedisClient = createRedisClient;
