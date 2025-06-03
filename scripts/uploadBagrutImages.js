const { initializeApp } = require("firebase/app");
const { getStorage, ref, uploadBytes } = require("firebase/storage");
const { readFile } = require("fs/promises");
const { join } = require("path");

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const subjects = [
  "algebra",
  "geometry",
  "trigonometry",
  "calculus",
  "statistics",
];

const uploadBagrutImages = async () => {
  try {
    for (const subject of subjects) {
      console.log(`Processing ${subject} images...`);

      const imagePath = join(
        process.cwd(),
        "bagrut_images",
        subject,
        "question1.jpg"
      );

      try {
        const imageBuffer = await readFile(imagePath);
        const storageRef = ref(storage, `bagrut/${subject}/question1.jpg`);

        await uploadBytes(storageRef, imageBuffer);
        console.log(`Successfully uploaded ${subject}/question1.jpg`);
      } catch (error) {
        console.error(`Error uploading ${subject} image:`, error);
      }
    }

    console.log("Finished uploading all images!");
  } catch (error) {
    console.error("Error in upload process:", error);
  }
};

uploadBagrutImages();
