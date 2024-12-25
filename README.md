# Project Setup Instructions

To get started with the project, follow these steps:

## 1. Clone the repository
Run the following command to install all the necessary dependencies:
```bash
npm i
```
## 2. Setup API Key

PORT = 4444  # Port where your application will run

MONGO_URI = mongodb://localhost:27017/4PNEWS  # MongoDB connection string

SESSION_SECRET = your_session_secret  # A secret key for session management

# GitHub OAuth credentials
GITHUB_CLIENT_ID = your_github_client_id  # GitHub OAuth client ID

GITHUB_CLIENT_SECRET = your_github_client_secret  # GitHub OAuth client secret
# Follow this link to understand GitHub OAuth setup: https://www.youtube.com/watch?v=tgO_ADSvY1I&t=38s

# Google OAuth credentials
GOOGLE_CLIENT_ID = your_google_client_id  # Google OAuth client ID

GOOGLE_CLIENT_SECRET = your_google_client_secret  # Google OAuth client secret
# Follow this video to understand Google OAuth setup: https://www.youtube.com/watch?v=HE7TUz7uYHc

# Nodemailer setup
NODEMAILER_PASSWORD = your_nodemailer_password  # Password for Nodemailer (email sending service)

NODEMAILER_ACCOUNT = your_nodemailer_account  # Email account for Nodemailer

# Follow this video to understand setup nodemailer: https://www.youtube.com/watch?v=n8fVC5UFRjA

# Cloudinary setup
CLOUDINARY_KEY = your_cloudinary_key  # Cloudinary API key for image uploading

CLOUDINARY_SECRET = your_cloudinary_secret  # Cloudinary API secret

CLOUDINARY_CLOUD_NAME = your_cloudinary_cloud_name  # Cloud name for your Cloudinary account
# Follow this video to understand how to make Cloudinary API key: https://www.youtube.com/watch?v=ok9mHOuvVSI

## 3.Finish step
Run the following command to run the application
```bash
node app.js
```
