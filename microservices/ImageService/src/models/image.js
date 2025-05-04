const minioClient = require('../config/db');    
const buckets = [
  'user-profiles',
  'post-images',
  'comment-attachments'
];
class ImageModel {       
    ImageModel() {
        this.minioClient = minioClient;
        this.initBuckets();
    }
async initBuckets() {
  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`Bucket ${bucket} ready.`);
    } catch (err) {
      console.error(`Error with bucket ${bucket}:`, err);
    }
  }
}

async uploadImage(bucketName, objectName, filePath) {
  try {
    await minioClient.fPutObject(bucketName, objectName, filePath);
    console.log(`Uploaded ${filePath} to ${bucketName}/${objectName}`);
    return { success: true, path: `${bucketName}/${objectName}` };
  } catch (err) {
    console.error("Upload Error:", err);
    return { success: false, error: err };
  }
}
async getImage(bucketName, objectName) {
  try {
    const dataStream = await minioClient.getObject(bucketName, objectName);
    return dataStream;
  } catch (err) {
    console.error("Get Error:", err);
    return null;
  }
}

async deleteImage(bucketName, objectName) {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`Deleted ${bucketName}/${objectName}`);
    return { success: true };
  } catch (err) {
    console.error("Deletion Error:", err);
    return { success: false, error: err };
  }
}
}
module.exports = new ImageModel();
