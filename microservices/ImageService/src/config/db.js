const Minio= require('minio');
const minioClient = new Minio.Client({
  endPoint: 'play.min.io',
  port: process.env.MINIO_PORT,
  useSSL: process.env.MINIO_USE_SSL,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
})