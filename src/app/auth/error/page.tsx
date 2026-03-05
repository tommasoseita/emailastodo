'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    OAuthCallback: 'There was a problem with the Google OAuth callback. Make sure the Gmail API is enabled in Google Cloud Console.',
    OAuthSignin: 'Could not start the sign-in flow. Check your Google OAuth credentials.',
    OAuthAccountNotLinked: 'This email is already linked to another account.',
    Callback: 'There was an error in the authentication callback.',
    Default: 'An unknown authentication error occurred.',
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="h-screen flex items-center justify-center bg-[#0a0a15]">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="text-red-400 text-6xl">!</div>
        <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
        <p className="text-[#888899]">{message}</p>
        {error && (
          <p className="text-xs text-[#555566] font-mono bg-[#1a1a2e] p-3 rounded-lg">
            Error code: {error}
          </p>
        )}
        <div className="space-y-3">
          <p className="text-sm text-[#666677]">Checklist:</p>
          <ul className="text-sm text-[#888899] text-left space-y-2">
            <li>1. Gmail API is enabled in Google Cloud Console</li>
            <li>2. OAuth consent screen has your email as test user</li>
            <li>3. Redirect URI matches: <code className="text-xs bg-[#1a1a2e] px-1 py-0.5 rounded">/api/auth/callback/google</code></li>
            <li>4. Environment variables are set correctly on Vercel</li>
          </ul>
        </div>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all duration-150"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#0a0a15]">
        <div className="text-[#555577] text-sm">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
