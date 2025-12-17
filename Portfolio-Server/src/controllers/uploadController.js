const constants = require('../config/constants');

const uploadFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const fileUrl = `/uploads/${req.file.filename}`;
  // File uploaded successfully
  
  res.json({
    success: true,
    filePath: fileUrl,
    fileName: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
};

module.exports = {
  uploadFile
};