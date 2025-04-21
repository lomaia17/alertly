import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./fireBaseConfig"; // make sure this points to your Firebase Firestore config

export async function addUserCredits(userId, creditsToAdd) {
  if (!userId || !creditsToAdd) return;

  const userRef = doc(db, "credits", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentCredits = userSnap.data().credits || 0;
    await updateDoc(userRef, {
      credits: currentCredits + creditsToAdd,
    });
  }
}
