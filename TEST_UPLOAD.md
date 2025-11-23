# Image Upload Testing Guide

## Current Status
✅ CORS has been fixed with:
- `origin: '*'` - Allows all origins
- OPTIONS handler for preflight requests
- Explicit `/api/upload` OPTIONS handler

## Testing Steps

### 1. Wait for Render Deployment
- Check Render dashboard: https://dashboard.render.com
- Wait for deployment to complete (2-3 minutes)
- Look for "Live" status

### 2. Test Image Upload

**For Services:**
1. Go to Admin Panel → Services tab
2. Click "Add Service"
3. Click "Choose File" on the new service
4. Select an image
5. Should see "Uploading..." then "Upload Success ✓"

**For Testimonials:**
1. Go to Admin Panel → Testimonials tab
2. Click "Add Testimonial"
3. Click "Choose File" for avatar
4. Select an image
5. Should see "Uploading..." then "Upload Success ✓"

**For Certificates:**
1. Go to Admin Panel → Certificates tab
2. Click "Add Certificate"
3. Click "Choose File" for logo
4. Select an image
5. Should see "Uploading..." then "Upload Success ✓"

### 3. Check for Errors

**If CORS error persists:**
```
Access to fetch at 'https://portfolio-505u.onrender.com/api/upload' 
from origin 'https://yohannesweb.netlify.app' has been blocked by CORS policy
```

**Solutions:**
1. Check Render logs for errors
2. Verify environment variables are set
3. Ensure Render service restarted properly

**If 401 Unauthorized:**
- Admin token is missing or incorrect
- Re-enter admin token when prompted

**If 400 Bad Request:**
- File might be too large (limit is 5MB)
- File might not be an image type

### 4. Verify Upload

After successful upload:
1. Image preview should update
2. "Save Changes" button should auto-save
3. Check frontend to see if image appears

## Backend Configuration

### CORS Settings (backend/src/server.js)
```javascript
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options('*', cors());
```

### Upload Endpoint
```javascript
app.options('/api/upload', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.post('/api/upload', checkAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filePath: `uploads/${req.file.filename}` });
});
```

## Common Issues

### Issue 1: CORS Error
**Cause:** Preflight OPTIONS request not handled
**Fix:** ✅ Already fixed with OPTIONS handlers

### Issue 2: 404 on Upload
**Cause:** Endpoint not found or wrong URL
**Fix:** Verify API_URL in admin/script.js matches Render URL

### Issue 3: File Not Uploading
**Cause:** Multer not receiving file
**Fix:** Ensure form field name is 'image'

### Issue 4: Uploads Directory Missing
**Cause:** Directory doesn't exist on Render
**Fix:** Render should create it automatically, or add to Dockerfile

## Expected Behavior

1. Click "Choose File" → File dialog opens
2. Select image → Shows filename
3. Shows "Uploading..." → Upload in progress
4. Shows "Upload Success ✓" → Upload complete
5. Image preview updates → Shows new image
6. Auto-saves content → Portfolio updated

## Troubleshooting

If upload still fails after Render deployment:

1. **Check Render Logs:**
   - Go to Render dashboard
   - Click on your service
   - View logs for errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

3. **Verify Environment:**
   - ADMIN_TOKEN is set on Render
   - PORT is set correctly
   - No other CORS middleware conflicts

4. **Test Endpoint Directly:**
   ```bash
   curl -X OPTIONS https://portfolio-505u.onrender.com/api/upload \
     -H "Origin: https://yohannesweb.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type, Authorization" \
     -v
   ```

## Success Indicators

✅ No CORS errors in console
✅ Upload shows "Upload Success ✓"
✅ Image preview updates
✅ Content auto-saves
✅ Image appears on frontend

---

**Last Updated:** After CORS fix deployment
**Status:** Waiting for Render to redeploy
