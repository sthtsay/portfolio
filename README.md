# Personal Portfolio Website

This repository contains the source code for a personal portfolio website. It's a full-stack application with a Node.js backend and a static frontend, designed to be easily updatable through a simple admin panel.

## Features

- **Dynamic Content:** The website's content (About, Services, Projects, etc.) is loaded dynamically from a `content.json` file.
- **Admin Panel:** A simple, password-protected admin panel allows for easy editing of all text content and images.
- **Image Uploads:** The admin panel supports uploading new images for portfolio items, which are stored on the backend.
- **Real-Time Updates:** Uses Socket.io to instantly refresh the portfolio page for all users when content is updated in the admin panel.

## Technology Stack

- **Frontend:**
  - HTML5
  - CSS3
  - Vanilla JavaScript
- **Backend:**
  - Node.js
  - Express.js
  - Multer for file uploads
  - Socket.io for real-time communication

## Project Structure

```
/
├── backend/
│   ├── src/
│   │   └── server.js         # Main server logic
│   ├── uploads/
│   ├── .dockerignore
│   ├── .env
│   ├── content.json
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   └── public/             # All static files served to the browser
│       ├── assets/
│       │   ├── css/
│       │   └── js/
│       ├── admin/
│       │   ├── index.html  # Admin panel
│       │   ├── style.css   # Admin panel styles
│       │   └── script.js   # Admin panel logic
│       └── index.html
│
├── .gitignore
└── README.md
```

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the backend directory:**
    ```bash
    cd portfolio/backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Start the backend server:**
    ```bash
    node src/server.js
    ```
    The server will start on `http://localhost:3000`.

## Usage

-   **View the Portfolio:** Open the `frontend/public/index.html` file in your web browser.
-   **Access the Admin Panel:** Open the `frontend/public/admin/index.html` file in your web browser.
    -   You will be prompted for a token to save changes or upload images. The default token is stored in `backend/.env`.