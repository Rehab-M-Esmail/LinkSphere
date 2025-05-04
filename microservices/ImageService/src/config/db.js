const dotenv = require('dotenv');
const minioClient = require('./MinIoConfig');
const connectToDatabase = async () => {
  try{
    //await minioClient.listBuckets();
    console.log('Connected to MinIO');
}
catch (err) {
  console.error('Error connecting to MinIO:', err);
  process.exit(1);

}
}
module.exports = connectToDatabase;