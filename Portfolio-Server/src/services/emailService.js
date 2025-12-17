const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    if (config.EMAIL_SERVICE && config.EMAIL_USER && config.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: config.EMAIL_SERVICE,
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASS
        }
      });
      this.enabled = true;
    } else {
      this.enabled = false;
      console.warn('Email service is not configured. Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASS in .env to enable.');
    }
  }

  async sendContactNotification(contactData) {
    if (!this.enabled) return false;
    
    try {
      const mailOptions = {
        from: `"Portfolio Contact" <${config.EMAIL_USER}>`,
        to: config.NOTIFICATION_EMAIL || config.EMAIL_USER,
        subject: `New Contact Form Submission from ${contactData.fullname}`,
        html: this.generateContactEmailHtml(contactData)
      };
      
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  generateContactEmailHtml(contactData) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50; min-width: 80px; display: inline-block;">Name:</strong>
            <span>${contactData.fullname}</span>
          </p>
          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50; min-width: 80px; display: inline-block;">Email:</strong>
            <span>${contactData.email}</span>
          </p>
          <p style="margin: 10px 0;">
            <strong style="color: #2c3e50; min-width: 80px; display: inline-block;">Message:</strong>
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin-top: 5px;">
            <p style="white-space: pre-line; margin: 0;">${contactData.message}</p>
          </div>
          <p style="margin: 10px 0; color: #7f8c8d; font-size: 0.9em;">
            <strong>Submitted:</strong> ${new Date(contactData.timestamp || Date.now()).toLocaleString()}
          </p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #95a5a6; font-size: 0.8em;">
          This email was sent automatically from your portfolio website contact form.
        </div>
      </div>
    `;
  }
}

module.exports = new EmailService();