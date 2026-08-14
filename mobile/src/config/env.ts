import { Platform } from 'react-native';

const DEV_API_URL = Platform.select({
  android: 'http://10.170.231.198:8000',
  ios: 'http://10.170.231.198:8000',
  web: 'http://localhost:8000',
  default: 'http://10.170.231.198:8000',
});

export const ENV = {
  API_BASE_URL: DEV_API_URL,
  GOOGLE_CLIENT_ID: 'your-google-oauth-client-id-here',
  APPLE_CLIENT_ID: 'your-apple-oauth-client-id-here',
};