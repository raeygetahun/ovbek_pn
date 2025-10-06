'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '@/app/utils/Firebase/config';
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetEmail = async () => {
    if (!auth) {
      return;
    }
    try {
      setSuccessMessage('');
      setErrorMessage('');
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(t('Password reset email sent. Check your inbox and spam folder.'));
    } catch (error: any) {
      setErrorMessage(error?.message || t('An unexpected error occurred. Please try again later.'));
    }
  };

  return (
    <div className="bg-gray-900">
      <div className="flex min-h-screen w-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <img
            className="mx-auto h-14 w-auto"
            src="https://overbeck-museum.de/wp-content/uploads/2019/09/cropped-Overbeck-Museum-favicon-192x192.png"
            alt="Overbeck"
          />
          <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-white">
            {t('Forgot Password')}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
                {t('Email address')}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                onClick={() => resetEmail()}
                disabled={!email}
                className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                {t('Send Password Reset Email')}
              </button>
            </div>
            {successMessage && (
              <p className="text-green-500 text-center font-bold text-xl">
                {successMessage}
              </p>
            )}
            {errorMessage && (
              <p className="text-red-500 text-center font-bold text-xl">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword;
