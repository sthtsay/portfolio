module.exports = {
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or missing token',
    VALIDATION_ERROR: 'Validation failed',
    FILE_TOO_LARGE: 'File size exceeds limit',
    INVALID_FILE_TYPE: 'Invalid file type',
    CONTENT_NOT_FOUND: 'Content not found',
    CONTACT_NOT_FOUND: 'Contact not found',
    SERVER_ERROR: 'Internal server error'
  },
  
  SUCCESS_MESSAGES: {
    CONTENT_UPDATED: 'Content updated successfully',
    CONTACT_SUBMITTED: 'Contact form submitted successfully',
    FILE_UPLOADED: 'File uploaded successfully',
    BACKUP_CREATED: 'Backup created successfully'
  },
  
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    PAYLOAD_TOO_LARGE: 413,
    INTERNAL_SERVER_ERROR: 500
  }
};