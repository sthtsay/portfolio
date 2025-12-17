const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const helpers = require('../utils/helpers');

class FileService {
  constructor() {
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await helpers.ensureDirectoryExists(config.UPLOADS_DIR);
    await helpers.ensureDirectoryExists(config.LOGS_DIR);
  }

  async loadContent() {
    return await helpers.loadJsonFile(config.CONTENT_PATH);
  }

  async saveContent(content) {
    await helpers.saveJsonFile(config.CONTENT_PATH, content);
    
    // Create backup
    await this.createBackup(content);
    
    return true;
  }

  async createBackup(content) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(config.ROOT_DIR, `content-backup-${timestamp}.json`);
      await helpers.saveJsonFile(backupPath, content);
      
      // Keep only last 10 backups
      await this.cleanupOldBackups();
      
      return backupPath;
    } catch (error) {
      console.error('Backup creation failed:', error);
      return null;
    }
  }

  async cleanupOldBackups(maxBackups = 10) {
    try {
      const files = await fs.readdir(config.ROOT_DIR);
      const backupFiles = files
        .filter(file => file.startsWith('content-backup-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(config.ROOT_DIR, file),
          time: file.match(/content-backup-(.+)\.json/)[1]
        }))
        .sort((a, b) => b.time.localeCompare(a.time)); // Sort newest first

      // Delete old backups beyond maxBackups
      for (let i = maxBackups; i < backupFiles.length; i++) {
        await fs.unlink(backupFiles[i].path);
        // Old backup deleted silently
      }
    } catch (error) {
      console.error('Backup cleanup failed:', error);
    }
  }

  async getUploadedFiles() {
    try {
      const files = await fs.readdir(config.UPLOADS_DIR);
      return files.map(file => ({
        name: file,
        url: `/uploads/${file}`,
        path: path.join(config.UPLOADS_DIR, file)
      }));
    } catch (error) {
      console.error('Error reading uploads directory:', error);
      return [];
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

module.exports = new FileService();