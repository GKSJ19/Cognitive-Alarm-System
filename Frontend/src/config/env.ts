import { Platform } from 'react-native';

// In local development, Android emulator accesses localhost via 10.0.2.2
// iOS simulator accesses localhost via 127.0.0.1 or localhost
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  ios: 'http://localhost:8000',
  default: 'http://localhost:8000',
});

export const ENV = {
  API_BASE_URL: DEV_API_URL,
  GOOGLE_CLIENT_ID: 'your-google-oauth-client-id-here',
  APPLE_CLIENT_ID: 'your-apple-oauth-client-id-here',
};
