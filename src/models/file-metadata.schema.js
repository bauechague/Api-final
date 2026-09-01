import mongoose from 'mongoose';

const fileMetadataSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  generatedName: { type: String, required: true },
  path: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  documentType: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

export default fileMetadataSchema;
