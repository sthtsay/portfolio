# 🎨 Dynamic Portfolio Management System

A professional, full-stack portfolio website with a powerful admin panel for complete content management. Built with modern web technologies and designed for developers, designers, and professionals who want full control over their online presence without touching code.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://yohannesweb.netlify.app)
[![Backend](https://img.shields.io/badge/backend-render-blue)](https://portfolio-505u.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

### 🎯 Portfolio Website
- **Fully Dynamic Content** - All content loads from backend API
- **Responsive Design** - Perfect on desktop, tablet, and mobile
- **SEO Optimized** - Dynamic meta tags for social media sharing
- **Real-time Updates** - Changes reflect immediately via Socket.io
- **Professional UI** - Modern, clean design with smooth animations
- **Contact Form** - Built-in form with validation and email notifications
- **Fast Loading** - Optimized images and lazy loading

### 🛠️ Admin Panel
- **Interactive Dashboard** - Charts and statistics at a glance
- **Complete Content Management** - Edit everything without code
- **Image Upload System** - Drag-and-drop file uploads
- **Real-time Preview** - See changes instantly
- **Settings Management** - Control site metadata and SEO
- **Contact Form Manager** - View and manage submissions
- **Social Media Manager** - Add/edit/remove social links
- **Secure Authentication** - Token-based access control

### 📊 Dashboard Features
- **Skills Distribution Chart** - Interactive pie chart with click-to-edit
- **Portfolio Completion Bar** - Track content completeness
- **Quick Statistics** - Content counts and unread messages
- **Recent Activity** - Latest contact form submissions

### 🎨 Content Sections
- **About Me** - Personal introduction and bio
- **Services** - What you offer with icons
- **Portfolio Projects** - Categorized project showcase
- **Experience Timeline** - Work history with dates
- **Education Timeline** - Academic background
- **Skills** - Visual skill bars with percentages
- **Testimonials** - Client reviews with modal view
- **Certificates** - Professional certifications gallery

## 🚀 Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No framework dependencies
- **Socket.io Client** - Real-time communication
- **Ionicons** - Beautiful icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **Multer** - File upload handling
- **Joi** - Data validation
- **Nodemailer** - Email notifications
- **Helmet** - Security headers
- **Morgan** - HTTP request logging
- **Rate Limiting** - API protection

### Deployment
- **Frontend:** Netlify (Static hosting)
- **Backend:** Render (Node.js hosting)
- **Database:** JSON file storage (easily upgradeable to MongoDB)

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── src/
│   │   └── server.js              # Main server with API endpoints
│   ├── uploads/                   # User-uploaded images
│   ├── .env                       # Environment variables
│   ├── content.json               # Dynamic content storage
│   ├── contacts.json              # Contact form submissions
│   ├── Dockerfile                 # Docker configuration
│   └── package.json               # Backend dependencies
│
├── frontend/
│   └── public/
│       ├── admin/
│       │   ├── index.html         # Admin panel interface
│       │   ├── style.css          # Admin panel styles
│       │   └── script.js          # Admin panel logic
│       ├── assets/
│       │   ├── css/
│       │   │   └── style.css      # Portfolio styles
│       │   ├── js/
│       │   │   └── script.js      # Portfolio logic
│       │   └── images/            # Static images
│       └── index.html             # Main portfolio page
│
├── .gitignore
├── README.md
└── LICENSE
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sthtsay/portfolio.git
   cd portfolio
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   ADMIN_TOKEN=your_secure_admin_token_here
   
   # Email Configuration (Optional)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_TO=recipient@email.com
   ```

4. **Start the Backend Server**
   ```bash
   npm start
   ```
   Server runs on `http://localhost:3000`

5. **Frontend Setup**
   
   Update the backend URL in `frontend/public/assets/js/script.js`:
   ```javascript
   const BACKEND_URL = 'http://localhost:3000';
   ```
   
   Update the backend URL in `frontend/public/admin/script.js`:
   ```javascript
   const API_URL = 'http://localhost:3000';
   ```

6. **Open the Portfolio**
   
   Open `frontend/public/index.html` in your browser or use a local server:
   ```bash
   # Using Python
   cd frontend/public
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server frontend/public -p 8000
   ```

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Environment Variables:** Add your `ADMIN_TOKEN` and email settings

### Frontend Deployment (Netlify)

1. Create a new site on [Netlify](https://netlify.com)
2. Connect your GitHub repository
3. Configure:
   - **Base Directory:** `frontend/public`
   - **Publish Directory:** `frontend/public`
4. Update backend URLs in `script.js` and `admin/script.js` to your Render URL

## 🔐 Admin Panel Access

1. Navigate to `/admin/` on your deployed site
2. Enter your admin token (set in `.env` file)
3. Start managing your portfolio content!

**Default Token:** Set in `backend/.env` as `ADMIN_TOKEN`

## 📖 API Documentation

### Content Management

#### Get Content
```http
GET /content.json
```
Returns all portfolio content.

#### Update Content
```http
POST /api/update-content
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "about": {...},
  "services": [...],
  "projects": [...],
  ...
}
```

### Contact Form

#### Submit Contact
```http
POST /api/contact
Content-Type: application/json

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "message": "Hello!"
}
```

#### Get Contacts (Admin)
```http
GET /api/contacts
Authorization: Bearer {admin_token}
```

### File Upload

#### Upload Image
```http
POST /api/upload
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data

file: [image file]
```

## 🎨 Customization

### Changing Colors

Edit `frontend/public/assets/css/style.css`:
```css
:root {
  --bg-gradient-onyx: linear-gradient(...);
  --bg-gradient-jet: linear-gradient(...);
  --orange-yellow-crayola: hsl(45, 100%, 72%);
  /* Modify these variables */
}
```

### Adding New Sections

1. Update `backend/content.json` with new section data
2. Add rendering logic in `frontend/public/assets/js/script.js`
3. Add admin form in `frontend/public/admin/script.js`

### Email Notifications

Configure in `backend/.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_TO=where-to-receive@email.com
```

For Gmail, enable 2FA and create an [App Password](https://support.google.com/accounts/answer/185833).

## 🔒 Security Features

- **Token-based Authentication** - Secure admin access
- **Rate Limiting** - Prevents API abuse
- **Helmet.js** - Security headers
- **Input Validation** - Joi schema validation
- **CORS Protection** - Controlled cross-origin requests
- **File Upload Restrictions** - Only images allowed
- **XSS Protection** - Sanitized inputs

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has required variables

### Images not loading
- Verify backend URL is correct in frontend scripts
- Check CORS settings in `server.js`
- Ensure `uploads/` directory exists and has write permissions

### Admin panel not saving
- Verify admin token is correct
- Check browser console for errors
- Ensure backend is running and accessible

### Contact form not working
- Check email configuration in `.env`
- Verify backend API endpoint is accessible
- Check browser console for validation errors

## 📈 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Blog section with markdown support
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Advanced analytics dashboard
- [ ] PDF resume generator
- [ ] Project filtering and search
- [ ] Comments system for blog posts
- [ ] OAuth authentication
- [ ] Automated backups

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Yohannes Mesfin**
- Portfolio: [yohannesweb.netlify.app](https://yohannesweb.netlify.app)
- GitHub: [@sthtsay](https://github.com/sthtsay)
- LinkedIn: [yohannesmesfin](https://www.linkedin.com/in/yohannesmesfin)

## 🙏 Acknowledgments

- Design inspiration from modern portfolio templates
- Icons by [Ionicons](https://ionic.io/ionicons)
- Fonts by [Google Fonts](https://fonts.google.com)

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact via the portfolio contact form
- Email: mesfiny711@gmail.com

---

⭐ **Star this repository if you find it helpful!**

Made with ❤️ by Yohannes Mesfin
