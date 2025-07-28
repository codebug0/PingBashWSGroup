import React, { useRef, useState } from 'react';
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSignin: (email: string, password: string) => void;
};

export const SigninPopup: React.FC<Props> = ({ isOpen, onClose, onSignin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSignUpClick = () => {
    window.location.href = 'http://pingbash.com/auth?Collection=signUp'; // Replace with your actual sign-up URL
  };

  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignIn = () => {
    if (!email.trim()) {
      emailRef.current?.focus();
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (!password.trim()) {
      passwordRef.current?.focus();
      return;
    }
    onSignin(email, password);
    // Proceed with login (e.g., call API here)
    console.log('Logging in with:', { email, password });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded shadow-md w-96">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-5 text-gray-500 hover:text-gray-800 text-2xl"
        >
          ×
        </button>

        <h2 className="text-2xl mb-4">Sign In</h2>

        <input
          ref={emailRef}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          ref={passwordRef}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          onClick={handleSignIn}
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 mb-3"
        >
          Sign In
        </button>

        <div className="text-sm text-center">
          Don't you have an account?{' '}
          <button
            onClick={handleSignUpClick}
            className="text-blue-600 hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};