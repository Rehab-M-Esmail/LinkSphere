const imageModel = require('../models/image');
const minioClient = require('../config/db');
class ImageController {
    async uploadImage(req, res) {
        //The object name will be the postId concatenated with comment or post to identify the image
        //The bucket name will be the userId + profileImage for profile images 
        const { bucketName,user_Id } = req.body;
        const objectName = `${user_Id}${req.file.originalname}`;
        switch (bucketName) {
            case user-profiles:
                objectName = `${user_Id}profileImage/${req.file.originalname}`;
                break;
            case post-images:
                objectName = `${user_Id}postImage/${req.file.originalname}`;
                break;
            case comment-attachments:
                objectName = `${user_Id}commentAttachment/${req.file.originalname}`;
                break;
            default:
                return res.status(400).json({ message: 'Invalid bucket name' });
                break;
        }
        const filePath = req.file.path;
        try {
            const result = await imageModel.uploadImage(bucketName, objectName, filePath);
            if (result.success) {
                res.status(201).json({ message: 'Image uploaded successfully', path: result.path });
            } else {
                res.status(500).json({ message: 'Error uploading image', error: result.error });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error uploading image', error });
        }
    }
    async getImage(req, res) {
        const { bucketName, objectName } = req.params;
        try {
            const dataStream = await imageModel.getImage(bucketName, objectName);
            if (dataStream) {
                res.set('Content-Type', 'image/jpeg');
                dataStream.pipe(res);
            } else {
                res.status(404).json({ message: 'Image not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error fetching image', error });
        }
    }
    async deleteImage(req, res) {
        const { bucketName, objectName } = req.params;
        try {
            const result = await imageModel.deleteImage(bucketName, objectName);
            if (result.success) {
                res.status(200).json({ message: 'Image deleted successfully' });
            } else {
                res.status(500).json({ message: 'Error deleting image', error: result.error });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting image', error });
        }
    }
        //I think i need to add a function to return all images of a specific user
    }
    module.exports = new ImageController();