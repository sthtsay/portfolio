const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

// Ensure directory exists
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
    throw error;
  }
};

// Load JSON file
const loadJsonFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
};

// Save JSON file
const saveJsonFile = async (filePath, data) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to save file ${filePath}:`, error);
    throw error;
  }
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Clean up old files in directory
const cleanupOldFiles = async (directory, maxAgeMs = 24 * 60 * 60 * 1000, pattern = /^temp_|temp-/i) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        // Check if file matches pattern and is older than maxAge
        if (now - stats.mtimeMs > maxAgeMs && pattern.test(file)) {
          await fs.unlink(filePath);
          // File cleaned up silently
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};

module.exports = {
  ensureDirectoryExists,
  loadJsonFile,
  saveJsonFile,
  generateId,
  formatDate,
  cleanupOldFiles
};