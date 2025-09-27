// src/components/SignOut.js
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const SignOut = () => {
  return <button onClick={() => signOut(auth)}>Sign Out</button>;
};

export default SignOut;
