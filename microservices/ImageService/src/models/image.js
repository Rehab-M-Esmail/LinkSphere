const { error } = require("console");
const minioClient = require("../config/db");
const dotenv = require("dotenv");
dotenv.config();
/*
const fs = require('fs');
const policies = JSON.parse(fs.readFileSync('../config/bucket-policy.json',(error) =>
    {if(error)
            {    console.error('Error reading bucket policy file:', error)
            } 
        }   
, {encoding:'utf8'}));
*/
const buckets = ["user-profiles", "post-images", "comment-attachments"];
class ImageModel {
  ImageModel() {
    this.minioClient = minioClient;
    this.initBuckets();
    this.buckets = buckets;
    this.applyPolicyByPattern();
  }
  async initBuckets() {
    for (const bucket of buckets) {
      try {
        const exists = await minioClient.bucketExists(bucket);
        if (!exists) await minioClient.makeBucket(bucket, "us-east-1");
        console.log(`Bucket ${bucket} ready.`);
      } catch (err) {
        console.error(`Error with bucket ${bucket}:`, err);
      }
    }
  }
  /*
async applyPolicyByPattern() {
    const buckets = await minioClient.listBuckets();
    for (const bucket of buckets) {
        try {
            // Determine which policy to apply based on bucket name
            const policyType = bucket.name.startsWith('public-') ? 'default' : 'restricted';
            const policyJSON = JSON.stringify(policies[policyType])
                .replace(/\$\{bucket\}/g, bucket.name);
                
            await minioClient.setBucketPolicy(bucket.name, policyJSON);
            console.log(`Applied ${policyType} policy to ${bucket.name}`);
        } catch (err) {
            console.error(`Error processing ${bucket.name}:`, err.message);
        }
    }
}
*/
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
  async getImage(bucketName, objectName, filePath) {
    try {
      const dataStream = await minioClient.fGetObject(
        bucketName,
        objectName,
        filePath
      );
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
