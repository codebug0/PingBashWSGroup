import React, { useRef, useState } from 'react';
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (email: string, name: string, password: string) => void;
  goToSignin:() => void
};

export const SignupPopup: React.FC<Props> = ({ isOpen, onClose, onSignup, goToSignin }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPW, setConfirmPW] = useState('');

  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPWRef = useRef<HTMLInputElement>(null);

  const handleSignUpClick = () => {
    window.location.href = 'http://pingbash.com/auth?Collection=signUp'; // Replace with your actual sign-up URL
  };

  const isValidEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUp = () => {
    if (!email.trim()) {
      emailRef.current?.focus();
      return;
    }    

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      emailRef.current?.focus();
      return;
    }

    if (!name.trim()) {
      nameRef.current?.focus();
      return;
    }

    if (!password.trim()) {
      passwordRef.current?.focus();
      return;
    }

    if (!confirmPW.trim()) {
      confirmPWRef.current?.focus();
      return;
    }

    if (password != confirmPW) {
        toast.error("Password does not match.");
        passwordRef.current?.focus();
        return;
    }

    onSignup(email, name, password);
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

        <h2 className="text-2xl mb-4">Sign Up</h2>

        <input
          ref={emailRef}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        <input
            ref={nameRef}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <input
          ref={confirmPWRef}
          type="password"
          placeholder="Password"
          value={confirmPW}
          onChange={(e) => setConfirmPW(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <button
          onClick={handleSignUp}
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600 mb-3"
        >
          Sign Up
        </button>

        <div className="text-md text-center">
          Do you have an account?{' '}
          <button
            onClick={goToSignin}
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};