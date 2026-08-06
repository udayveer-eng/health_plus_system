import File from "../models/File.js";
import UploadService from "../services/uploadService.js";

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    // Determine Cloudinary resource_type. PDFs must be uploaded as 'raw' or 'image' (Cloudinary treats PDF as image sometimes, but raw is safer for non-image docs)
    let resourceType = "auto";
    if (req.file.mimetype === "application/pdf" || req.file.mimetype.includes("msword") || req.file.mimetype.includes("document")) {
      resourceType = "raw";
    }

    const folder = req.body.folder || "healthpulse/general";

    // Upload to Cloudinary via stream
    const uploadResult = await UploadService.uploadStream(req.file.buffer, folder, resourceType);

    // Save metadata to MongoDB
    const fileDoc = await File.create({
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      resourceType,
      uploadedBy: req.user.userId, // Requires authMiddleware
    });

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: fileDoc,
    });
  } catch (error) {
    console.error("Upload File Error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload file" });
  }
};

const getFileMetadata = async (req, res) => {
  try {
    const { id } = req.params;

    const fileDoc = await File.findOne({ _id: id, isDeleted: false });

    if (!fileDoc) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    return res.status(200).json({
      success: true,
      file: fileDoc,
    });
  } catch (error) {
    console.error("Get File Metadata Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch file details" });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    // We ensure the user deleting the file is the one who uploaded it
    const fileDoc = await File.findOne({ _id: id, uploadedBy: req.user.userId, isDeleted: false });

    if (!fileDoc) {
      return res.status(404).json({ success: false, message: "File not found or unauthorized" });
    }

    // Attempt to remove from Cloudinary to free up storage
    try {
      await UploadService.destroyFile(fileDoc.publicId, fileDoc.resourceType);
    } catch (cloudError) {
      console.error("Cloudinary deletion failed, but continuing with DB soft delete:", cloudError);
    }

    // Soft delete in DB
    fileDoc.isDeleted = true;
    fileDoc.deletedAt = new Date();
    await fileDoc.save();

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete File Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete file" });
  }
};

export { uploadFile, getFileMetadata, deleteFile };
