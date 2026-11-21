// Firebase Web কনফিগারেশন (মান আসে frontend/.env ফাইল থেকে)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// API Key না থাকলে Firebase চালু হয় না (অ্যাপ ক্র্যাশ করবে না, লগইনের সময় বার্তা দেখাবে)
export const auth = firebaseConfig.apiKey ? getAuth(initializeApp(firebaseConfig)) : null;
