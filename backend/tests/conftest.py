import os

os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://icap:icap_dev_password@localhost:5432/icap")
