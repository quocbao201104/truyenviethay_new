require("dotenv").config();

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://truyen-viet-hay.vercel.app",
  "https://truyenviethay.id.vn",
  "https://www.truyenviethay.id.vn",
];

const splitOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const getAllowedOrigins = () => {
  const envOrigins = [
    ...splitOrigins(process.env.CLIENT_URL),
    ...splitOrigins(process.env.CLIENT_URLS),
    ...splitOrigins(process.env.CORS_ORIGINS),
  ];

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])];
};

module.exports = {
  getAllowedOrigins,
};
