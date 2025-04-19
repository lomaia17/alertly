// src/app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/fireBaseConfig';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // You can send back the user information or generate a custom token, etc.
    return NextResponse.json({ message: 'User created successfully', user: userCredential.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
