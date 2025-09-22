'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import signup from '@/app/utils/api/volunteerSignup';

const Signup: React.FC = () => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [signupError, setSignupError] = useState<string>('');
    const [signupSuccess, setSignupSuccess] = useState<string>('');
    const [passwordAgain, setPasswordAgain] = useState('');
    const [isSigningUp, setIsSigningUp] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsSigningUp(true);
            const response = await signup(email, password, firstName, lastName);
            if (response.success) {
                setSignupError('');
                setSignupSuccess(
                    t('Thank you for registering. An admin will review your request and decide shortly.')
                );
            } else {
                setSignupSuccess('');
                const errorData = JSON.parse(response.error ?? "{}");
                const errorMessage = errorData.error
                    ? t(String(errorData.error))
                    : t('Signup failed. Please try again.');
                setSignupError(errorMessage);
            }
        } catch (error) {
            setSignupSuccess('');
            setSignupError(t('An unexpected error occurred. Please try again later.'));
        } finally {
            setIsSigningUp(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center px-6 py-12 lg:px-8">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-gray-900">
                <div className="flex w-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            className="mx-auto h-10 w-auto"
                            src="https://overbeck-museum.de/wp-content/uploads/2019/09/cropped-Overbeck-Museum-favicon-192x192.png"
                            alt="Overbeck"
                        />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                            {t('Sign Up')}
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                        {t('Password')}
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
                                        {t('Password Again')}
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="passwordAgain"
                                        name="passwordAgain"
                                        type="password"
                                        autoComplete="current-password"
                                        onChange={(e) => setPasswordAgain(e.target.value)}
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-white">
                                        {t('First Name')}
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="firstName"
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-white">
                                        {t('Last Name')}
                                    </label>
                                </div>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                />
                            </div>
                            <div>
                                <button
                                    disabled={(!email || !password || !passwordAgain) || (password !== passwordAgain) || isSigningUp}
                                    className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    {isSigningUp ? t('Submitting...') : t('Sign Up')}
                                </button>
                            </div>
                            {signupSuccess && (
                                <p className="text-green-400 text-center font-bold text-xl">{signupSuccess}</p>
                            )}
                            {signupError && (
                                <p className="text-red-500 text-center font-bold text-xl">{signupError}</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Signup;
