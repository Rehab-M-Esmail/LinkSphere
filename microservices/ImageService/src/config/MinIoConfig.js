const Minio = require("minio");
const dotenv = require("dotenv");
dotenv.config(); // An issue here exists cz of dotenv file not being found

// Convert the string to boolean properly
const convertToBool = (str) => {
  if (typeof str === 'boolean') return str;
  return str === 'true' || str === '1' || str === 'yes';
};

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: convertToBool(process.env.MINIO_USE_SSL),
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  region: process.env.MINIO_REGION || "me-central-1",
});
minioClient
  .listBuckets()
  .then(() => console.log("✅ MinIO connection successful!"))
  .catch((err) => console.error("❌ MinIO connection failed:", err.message));

module.exports = minioClient;
