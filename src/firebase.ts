import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";

// Your Web App's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDTfO56-SWOR03m5Xfps16kvKn-Ebbem4",
  authDomain: "hwday-4159d.firebaseapp.com",
  projectId: "hwday-4159d",
  storageBucket: "hwday-4159d.firebasestorage.app",
  messagingSenderId: "831679238220",
  appId: "1:831679238220:web:7efe74cab9ab94049ca4e9"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Custom Database ID
export const db = getFirestore(app, "ai-studio-f8661d92-d7de-4ab2-95b3-9cedf6c140ab");

// CRITICAL CONSTRAINT: Validate Connection to Firestore on boot
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection test complete.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.", error);
    } else {
      console.log("Firebase initialized (offline cache enabled or database ready).", error);
    }
    return false;
  }
}

// Simple export for other files to use raw db
export default app;
