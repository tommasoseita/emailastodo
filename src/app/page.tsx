'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/mail');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a15]">
        <div className="text-[#555577] text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a15]">
      <div className="text-center space-y-8 animate-fadeIn">
        {/* Logo */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white tracking-tight">Supermail</h1>
          <p className="text-[#666688] text-lg">Email as a Todo List</p>
        </div>

        {/* Features */}
        <div className="flex items-center gap-6 text-sm text-[#555577]">
          <span>Keyboard-first</span>
          <span className="text-[#1e1e3a]">|</span>
          <span>Split Inbox</span>
          <span className="text-[#1e1e3a]">|</span>
          <span>Blazing fast</span>
        </div>

        {/* Sign In Button */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/mail' })}
          className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all duration-150 shadow-lg shadow-white/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Footer */}
        <p className="text-xs text-[#333355]">
          Your emails stay private. We only access what you see.
        </p>
      </div>
    </div>
  );
}
