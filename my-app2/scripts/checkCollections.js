import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBKqM0lNqBRjgNwiNKBO3tmwStl1HQO_Is",
  authDomain: "web2025-592b4.firebaseapp.com",
  projectId: "web2025-592b4",
  storageBucket: "web2025-592b4.firebasestorage.app",
  messagingSenderId: "635879071437",
  appId: "1:635879071437:web:cd939e0a7198125e3fd384"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCollections() {
  console.log('=== בדיקת all_questions ===');
  try {
    const oldSnapshot = await getDocs(collection(db, 'all_questions'));
    console.log('all_questions מכיל:', oldSnapshot.docs.length, 'שאלות');
    if (oldSnapshot.docs.length > 0) {
      const subjects = [...new Set(oldSnapshot.docs.map(doc => doc.data().subject))];
      console.log('נושאים ב-all_questions:', subjects);
    }
  } catch (e) {
    console.log('all_questions לא קיים או ריק');
  }
  
  console.log('\n=== בדיקת all_questions1 ===');
  try {
    const newSnapshot = await getDocs(collection(db, 'all_questions1'));
    console.log('all_questions1 מכיל:', newSnapshot.docs.length, 'שאלות');
    if (newSnapshot.docs.length > 0) {
      const subjects = [...new Set(newSnapshot.docs.map(doc => doc.data().subject))];
      console.log('נושאים ב-all_questions1:', subjects);
    }
  } catch (e) {
    console.log('all_questions1 לא קיים או ריק');
  }
}

checkCollections(); 