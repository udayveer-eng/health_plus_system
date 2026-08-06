import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

class UploadService {
  /**
   * Uploads a memory buffer to Cloudinary
   * @param {Buffer} buffer - The file buffer
   * @param {String} folder - Cloudinary folder name
   * @param {String} resourceType - 'image', 'video', 'raw', or 'auto'
   * @returns {Promise<Object>} - Cloudinary response
   */
  static uploadStream(buffer, folder = "healthpulse", resourceType = "auto") {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });

      readableStream.pipe(upload);
    });
  }

  /**
   * Deletes a file from Cloudinary using its public ID
   * @param {String} publicId - The Cloudinary public ID
   * @param {String} resourceType - Ensure correct type (e.g. 'raw' for PDFs)
   * @returns {Promise<Object>}
   */
  static destroyFile(publicId, resourceType = "auto") {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}

export default UploadService;
