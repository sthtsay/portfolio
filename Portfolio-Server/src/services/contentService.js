const fileService = require('./fileService');
const dateSorter = require('../utils/dateSorter');
const AppError = require('../utils/AppError');
const constants = require('../config/constants');

class ContentService {
  async getContent() {
    const content = await fileService.loadContent();
    if (!content) {
      throw new AppError(constants.ERROR_MESSAGES.CONTENT_NOT_FOUND, 404);
    }
    return content;
  }

  async updateContent(contentData) {
    // Sort education and experience by end date
    if (contentData.education) {
      contentData.education = dateSorter.sortByEndDate(contentData.education);
    }
    
    if (contentData.experience) {
      contentData.experience = dateSorter.sortByEndDate(contentData.experience);
    }

    // Save to file
    await fileService.saveContent(contentData);
    
    return {
      success: true,
      message: constants.SUCCESS_MESSAGES.CONTENT_UPDATED,
      timestamp: new Date().toISOString()
    };
  }

  async createBackup() {
    const content = await this.getContent();
    const backupPath = await fileService.createBackup(content);
    
    return {
      success: true,
      message: constants.SUCCESS_MESSAGES.BACKUP_CREATED,
      backupPath: path.basename(backupPath)
    };
  }
}

module.exports = new ContentService();