const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const emailService = require('./emailService');
const helpers = require('../utils/helpers');

class ContactService {
  async getAllContacts() {
    const contacts = await helpers.loadJsonFile(config.CONTACTS_PATH);
    return contacts || [];
  }

  async saveContacts(contacts) {
    await helpers.saveJsonFile(config.CONTACTS_PATH, contacts);
  }

  async createContact(contactData) {
    const contacts = await this.getAllContacts();
    
    const newContact = {
      id: helpers.generateId(),
      fullname: contactData.fullname,
      email: contactData.email,
      message: contactData.message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    contacts.unshift(newContact); // Add to beginning (most recent first)
    await this.saveContacts(contacts);
    
    return newContact;
  }

  async getContactById(id) {
    const contacts = await this.getAllContacts();
    return contacts.find(contact => contact.id === id);
  }

  async markAsRead(id) {
    const contacts = await this.getAllContacts();
    const contact = contacts.find(c => c.id === id);
    
    if (!contact) return false;
    
    contact.read = true;
    await this.saveContacts(contacts);
    return true;
  }

  async deleteContact(id) {
    const contacts = await this.getAllContacts();
    const initialLength = contacts.length;
    const filteredContacts = contacts.filter(contact => contact.id !== id);
    
    if (filteredContacts.length === initialLength) {
      return false; // No contact was deleted
    }
    
    await this.saveContacts(filteredContacts);
    return true;
  }

  async getUnreadCount() {
    const contacts = await this.getAllContacts();
    return contacts.filter(contact => !contact.read).length;
  }

  async sendEmailNotification(contactData) {
    if (emailService.enabled) {
      return await emailService.sendContactNotification(contactData);
    }
    return false;
  }
}

module.exports = new ContactService();