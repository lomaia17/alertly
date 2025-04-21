import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/fireBaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/fireBaseConfig';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Get the user's UID
    const user = userCredential.user;

    // Create a Firestore document for the user in the "credits" collection
    const creditsRef = doc(db, 'credits', user.uid);
    console.log('Creating user doc with credits:', user.email);

    // Initialize the user document in the "credits" collection
    await setDoc(creditsRef, {
      email: user.email,
      credits: 5,  // Initial credit value
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log('User doc created in credits collection with credits:', user.email);

    // Send back a response to the client with the user info
    return NextResponse.json({ message: 'User created successfully', user: userCredential.user });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
