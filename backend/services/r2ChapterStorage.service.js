const crypto = require("crypto");
const { promisify } = require("util");
const { gzip } = require("zlib");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const gzipAsync = promisify(gzip);

const REQUIRED_ENV = [
  "R2_ENDPOINT",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_PUBLIC_BASE_URL",
];

let r2Client;

const getR2Client = () => {
  if (r2Client) return r2Client;
  r2Client = new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
    maxAttempts: 1,
  });
  return r2Client;
};

const ensureEnv = () => {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`Missing R2 env vars: ${missing.join(", ")}`);
  }
};

const buildKey = (storyId, chapterId) => `chapters/${storyId}/${chapterId}.json`;

const joinUrl = (base, pathPart) => {
  const baseClean = base.replace(/\/+$/, "");
  const pathClean = pathPart.replace(/^\/+/, "");
  return `${baseClean}/${pathClean}`;
};

const sha256 = (input) => crypto.createHash("sha256").update(input).digest("hex");

const uploadChapterJson = async ({ storyId, chapterId, title, content, updatedAt }) => {
  ensureEnv();

  const payload = JSON.stringify({
    id: chapterId,
    story_id: storyId,
    title,
    content,
    updated_at: updatedAt || new Date().toISOString(),
  });

  const contentHash = sha256(payload);
  const contentLength = content ? content.length : 0;

  const gzBuffer = await gzipAsync(Buffer.from(payload, "utf8"));
  const key = buildKey(storyId, chapterId);

  const r2 = getR2Client();
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: gzBuffer,
      ContentType: "application/json",
      ContentEncoding: "gzip",
      CacheControl: "public, max-age=31536000, immutable, stale-while-revalidate=86400",
    })
  );

  const contentUrl = joinUrl(process.env.R2_PUBLIC_BASE_URL, key);
  return { contentUrl, contentHash, contentLength };
};

module.exports = {
  uploadChapterJson,
};
