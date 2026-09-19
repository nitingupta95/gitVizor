import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBuo_lcU__SeZ0_gZo5HKjuMOacgZaT8Vs",
  authDomain: "githubsaas-dbedd.firebaseapp.com",
  projectId: "githubsaas-dbedd",
  storageBucket: "githubsaas-dbedd.firebasestorage.app",
  messagingSenderId: "155393628637",
  appId: "1:155393628637:web:646bb7987de39f8458be34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadFile(file: File, setProgress: (progress: number) => void): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (setProgress) setProgress(progress);
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        },
        (error) => {
          reject(error instanceof Error ? error : new Error(String(error)));
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL as string);
          });
        }
      );
    } catch (error) {
      console.log("Error importing firebase/storage:", error);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
