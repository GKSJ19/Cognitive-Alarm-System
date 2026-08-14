import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCpBjr3UTLDLt1cULbg8_GOGf_JHpeCC5o',
  authDomain: 'cognitive-alarm.firebaseapp.com',
  projectId: 'cognitive-alarm',
  storageBucket: 'cognitive-alarm.firebasestorage.app',
  messagingSenderId: '514908313029',
  appId: '1:514908313029:web:f2c3331da4a8b467eae7ac',
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  authInstance = getAuth(app);
}
export const auth = authInstance;

export const db = getFirestore(app);
