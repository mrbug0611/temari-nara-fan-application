# Environment Variables Reference

Copy `.env.example` to `.env` and fill in each value before starting the server. The server will fail fast with a descriptive error if any required variable is missing.

---

## Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `NODE_ENV` | No | `development` | Environment mode. Set to `production` in production |

---

## Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | — | Full MongoDB connection string. For local dev: `mongodb://localhost:27017/temari-app`. For Atlas: your cluster connection string |

**Tip:** Create a dedicated database user in MongoDB Atlas with read/write access scoped to your database only — never use the Atlas admin credentials.

---

## Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | **Yes** | — | Secret key used to sign and verify JWT tokens. Generate a strong random string: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

> ⚠️ Never commit this value or use a short/predictable string in production. A compromised JWT secret allows anyone to forge authentication tokens.

---

## CORS

| Variable | Required | Default | Description |
|---|---|---|---|
| `FRONTEND_URL` | No | `http://localhost:3000` | The origin of your frontend. Only requests from this URL will be accepted by CORS. Update to your production domain when deploying |

---

## Email (Gmail OAuth2)

All five of these must be set for the contact form and any server-sent emails to work. The server throws on startup if any are missing.

| Variable | Required | Description |
|---|---|---|
| `EMAIL_USER` | **Yes** | The Gmail address that sends emails (e.g. `noreply@yourapp.com`) |
| `EMAIL_FROM` | **Yes** | Display "From" address in outgoing emails |
| `ADMIN_EMAIL` | **Yes** | Address that receives contact form submissions |
| `GOOGLE_CLIENT_ID` | **Yes** | OAuth2 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | **Yes** | OAuth2 client secret |
| `GOOGLE_REDIRECT_URL` | **Yes** | Must be `https://developers.google.com/oauthplayground` |
| `GOOGLE_REFRESH_TOKEN` | **Yes** | Long-lived refresh token. See below for how to generate |
| `EMAIL_SERVICE` | No | `gmail` | Email service identifier passed to Nodemailer |
| `EMAIL_PASSWORD` | No | — | Legacy field, not used when OAuth2 is configured |

### Generating the OAuth2 Refresh Token

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project
2. Enable the **Gmail API** under APIs & Services → Library
3. Go to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Set Application type to **Web Application**
5. Add `https://developers.google.com/oauthplayground` as an Authorized Redirect URI
6. Note your Client ID and Client Secret
7. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
8. Click the settings gear → check **Use your own OAuth credentials** → enter your Client ID and Secret
9. In Step 1, find **Gmail API v1** and authorize `https://mail.google.com/`
10. Click **Authorize APIs**, sign in with your Gmail account, and grant access
11. In Step 2, click **Exchange authorization code for tokens**
12. Copy the `refresh_token` value into `GOOGLE_REFRESH_TOKEN`

Refresh tokens do not expire unless revoked. You should regenerate one if you rotate your OAuth2 credentials.

---

## External APIs

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHER_API_KEY` | **Yes** (for weather features) | API key for [OpenWeatherMap](https://openweathermap.org/api). Free tier supports 1,000 calls/day and is sufficient for development and small deployments |
| `BACKEND_URL` | No | `http://localhost:5000` | Backend base URL, used for internal references |

### Getting an OpenWeatherMap API Key

1. Register for a free account at [openweathermap.org](https://openweathermap.org/api)
2. Go to your profile → API Keys
3. Copy the default key or generate a new one
4. Note: New keys can take up to 2 hours to activate

---

## File Uploads

| Variable | Required | Default | Description |
|---|---|---|---|
| `MAX_FILE_SIZE` | No | `10485760` | Maximum upload size in bytes (default: 10MB) |
| `UPLOAD_DIR` | No | `./uploads` | Directory for uploaded files (relative to project root). Files are served from `public/uploads/` after processing |

---

## Optional / Future

| Variable | Required | Description |
|---|---|---|
| `REDIS_URL` | No | Redis connection string for future caching layer (e.g. `redis://localhost:6379`). Not currently used by the app |

---

## Example `.env` for Local Development

```dotenv
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/temari-app

# Auth
JWT_SECRET=replace-with-64-char-hex-string

# CORS
FRONTEND_URL=http://localhost:3000

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@example.com
EMAIL_FROM=noreply@example.com
ADMIN_EMAIL=admin@example.com
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URL=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=your-refresh-token

# Weather
OPENWEATHER_API_KEY=your-openweathermap-api-key

# Backend
BACKEND_URL=http://localhost:5000

# Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

---

## Production Checklist

Before deploying to production, verify:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is a strong random 64-character string, not the development placeholder
- [ ] `MONGODB_URI` points to your production database with a least-privilege user
- [ ] `FRONTEND_URL` is your production domain (with `https://`)
- [ ] All Google OAuth2 values are populated and the refresh token has been verified
- [ ] `OPENWEATHER_API_KEY` is valid
- [ ] The `.env` file is **not** committed to version control (it's in `.gitignore`)
- [ ] Environment variables are set via your hosting platform's secrets manager, not a `.env` file on the server