"""
Configuration settings for Cognitive Alarm System
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./alarm_system.db")

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
API_DEBUG = os.getenv("API_DEBUG", "False").lower() == "true"

# CORS Configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
CORS_CREDENTIALS = os.getenv("CORS_CREDENTIALS", "true").lower() == "true"
CORS_METHODS = os.getenv("CORS_METHODS", "*").split(",")
CORS_HEADERS = os.getenv("CORS_HEADERS", "*").split(",")

# AI Model Configuration
ANOMALY_CONTAMINATION = float(os.getenv("ANOMALY_CONTAMINATION", "0.1"))
PATTERN_EPS = float(os.getenv("PATTERN_EPS", "0.5"))
PATTERN_MIN_SAMPLES = int(os.getenv("PATTERN_MIN_SAMPLES", "5"))

# System Configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
TIMEZONE = os.getenv("TIMEZONE", "UTC")

# Application Info
APP_NAME = "Cognitive Alarm System"
APP_VERSION = "1.0.0"
