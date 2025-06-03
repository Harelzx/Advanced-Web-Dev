import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/app/firebase/config";

export const uploadImage = async (file, path) => {
  try {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (imagePath) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, path) => {
  const uploadPromises = files.map((file) => uploadImage(file, path));
  return Promise.all(uploadPromises);
};
