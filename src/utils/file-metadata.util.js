export function buildFileMetadata(file, documentType) {
  return {
    originalName: file.originalname,
    generatedName: file.filename,
    path: file.path,
    mimeType: file.mimetype,
    size: file.size,
    documentType,
    uploadedAt: new Date()
  };
}
