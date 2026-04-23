import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    // Check if there is already a popup attempt in progress
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') {
      console.error("Popup blocked by browser. Please allow popups for this site.");
      alert("The login window was blocked by your browser. Please allow popups or open the app in a new tab.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.warn("Popup request was cancelled by the user or another request.");
    } else {
      console.error("Login failed", error);
    }
    throw error;
  }
};

export const createOrder = async (orderData: {
  customerName: string;
  phone: string;
  shippingAddress: string;
  productName: string;
  email?: string;
}) => {
  try {
    const ordersRef = collection(db, 'orders');
    return await addDoc(ordersRef, {
      ...orderData,
      orderStatus: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Order creation failed", error);
    throw error;
  }
};

export const checkIfAdmin = async (uid: string) => {
  const adminRef = doc(db, 'admins', uid);
  const docSnap = await getDoc(adminRef);
  return docSnap.exists();
};

export const createReview = async (reviewData: {
  productName: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  try {
    const reviewsRef = collection(db, 'reviews');
    return await addDoc(reviewsRef, {
      ...reviewData,
      isApproved: true,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Review extraction failed", error);
    throw error;
  }
};

export const logEvent = async (eventType: 'view' | 'click', details: { page?: string, product?: string } = {}) => {
  try {
    const visitorsRef = collection(db, 'visitors');
    await addDoc(visitorsRef, {
      eventType,
      ...details,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    // Silent fail for analytics to not disturb user experience
    console.warn("Analytics sync paused", error);
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error("Order deletion failed", error);
    throw error;
  }
};
