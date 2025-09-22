'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/utils/Firebase/config';
import { useFirebaseAuth } from '@/app/utils/Firebase/useFirebaseAuth';
import LanguageSwitcher from '@/app/components/languageSwitcher/LanguageSwitcher';


const Signin: React.FC = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signinError, setsigninError] = useState<string>('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const router = useRouter();
    const { user, isAdmin, loading } = useFirebaseAuth();


    useEffect(() => {
        if (loading) return;
        if (!user) return;
        if (isAdmin) {
            router.push('/admin/dashboard');
        } else {
            router.push('/volunteer/dashboard');
        }
    }, [user, isAdmin, loading, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setIsSigningIn(true);
            await signInWithEmailAndPassword(auth, email, password);
            setsigninError("");
        } catch (error) {
            setsigninError(t('Incorrect email or password'));
            console.error('Sign in failed:', error);
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900">
            <div className="absolute right-6 top-6 bg-white rounded-lg">
                <LanguageSwitcher />
            </div>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8">
                <div className="flex min-h-full flex-1 flex-col justify-center px-10 py-14 lg:px-12 bg-gray-900">
                    <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                        <img
                            className="mx-auto h-14 w-auto"
                            src="https://overbeck-museum.de/wp-content/uploads/2019/09/cropped-Overbeck-Museum-favicon-192x192.png"
                            alt="Overbeck"
                        />
                        <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-white">
                            {t('Sign in to your account')}
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
                                        type="text"
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
                                    <div className="text-sm">
                                        <div onClick={() => router.push('/forgot-password')} className="cursor-pointer font-semibold text-indigo-400 hover:text-indigo-300">
                                            {t('Forgot password?')}
                                        </div>
                                    </div>
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
                                <button
                                    disabled={!email || !password || isSigningIn}
                                    className="disabled:opacity-40 flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    {isSigningIn ? t('Signing in...') : t('Sign In')}
                                </button>
                            </div>
                            {signinError && <p className="text-red-500 text-center font-bold text-xl">{signinError}</p>}
                        </div>

                        <p className="mt-10 text-center text-sm text-gray-400">
                            {t('Not a member?')}{' '}
                            <button onClick={() => router.push('/volunteer/signup')} className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300">
                                {t('Sign Up')}
                            </button>
                        </p>
                    </div>
                </div>
            </form>
        </div >
    );
};

export default Signin;
