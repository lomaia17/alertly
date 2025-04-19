import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/fireBaseConfig';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Important: Force token refresh to ensure client-side gets updated
    await userCredential.user.getIdToken(true);

    return NextResponse.json({
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      }
    });
  } catch (error: unknown) {
    console.error('Login API error:', error);
    let errorMessage = 'Login failed';
    if (error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid password';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'User not found';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}