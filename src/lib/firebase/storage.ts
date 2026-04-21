import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./client";
import imageCompression from "browser-image-compression";

/**
 * Common configuration resolving standard client-side footprint limiting.
 */
export const compressImage = async (file: File, maxSizeMB: number, maxWidthOrHeight: number) => {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error("Compression failed:", error);
    throw error;
  }
};

/**
 * Upload an Avatar
 * Parses input through a 1MB bounds check down to max 0.5MB, limiting coordinates natively to 1024x1024.
 */
export const uploadAvatar = async (file: File, uid: string) => {
  const compressed = await compressImage(file, 0.5, 1024);
  const storageRef = ref(storage, `avatars/${uid}.jpg`);
  
  await uploadBytes(storageRef, compressed);
  return await getDownloadURL(storageRef);
};

/**
 * Upload Submission Photos
 * Parses input through generic submission constraints (3MB limits map back natively down to 2MB).
 */
export const uploadSubmissionPhoto = async (file: File, submissionId: string) => {
  const compressed = await compressImage(file, 2, 1920);
  const ext = file.name.split('.').pop() || "jpg";
  const filename = `${Date.now()}.${ext}`;
  const storageRef = ref(storage, `submissions/${submissionId}/${filename}`);
  
  await uploadBytes(storageRef, compressed);
  return await getDownloadURL(storageRef);
};
