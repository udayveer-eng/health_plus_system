import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true, // Cloudinary unique ID
    },
    secureUrl: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    resourceType: {
      type: String,
      default: "auto", // image, raw (pdf, docx)
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

export default File;
