const contentService = require('../services/contentService');
const constants = require('../config/constants');

const getContent = async (req, res, next) => {
  try {
    const content = await contentService.getContent();
    res.json(content);
  } catch (error) {
    next(error);
  }
};

const updateContent = async (req, res, next) => {
  try {
    const result = await contentService.updateContent(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createBackup = async (req, res, next) => {
  try {
    const result = await contentService.createBackup();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContent,
  updateContent,
  createBackup
};