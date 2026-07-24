# Configuration Reference — Milestone 2

All configuration parameters can be overridden using environment variables or a `.env` file in the root directory.

| Variable Name | Default Value | Description |
|---|---|---|
| `APP_NAME` | `Intelligent Cognitive Alarm Platform` | Name displayed in docs |
| `ENVIRONMENT` | `local` | `local`, `staging`, or `production` |
| `DEBUG` | `false` | Enable SQL query echo and verbose logging |
| `API_V1_PREFIX` | `/api/v1` | Base route prefix for API v1 |
| `BACKEND_CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed CORS origins |
| `DATABASE_URL` | `postgresql+asyncpg://icap:icap_dev_password@db:5432/icap` | PostgreSQL async connection URI |
| `MONGO_URL` | `mongodb://icap:icap_dev_password@mongo:27017` | MongoDB connection URI |
| `MONGO_DB_NAME` | `icap_analytics` | MongoDB database name |
| `JWT_SECRET_KEY` | `09d25e094faa6ca2556c818166b...` | HMAC-SHA256 secret key |
| `JWT_ALGORITHM` | `HS256` | Token signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifespan |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token lifespan |
| `FIREBASE_CREDENTIALS_PATH` | `""` | Path to FCM service account JSON |
