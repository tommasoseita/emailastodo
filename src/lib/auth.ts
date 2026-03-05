import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify',
            'https://www.googleapis.com/auth/gmail.compose',
            'https://www.googleapis.com/auth/gmail.send',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      try {
        if (account) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expiresAt = account.expires_at;
        }

        // Refresh token if expired
        if (token.expiresAt && Date.now() / 1000 > (token.expiresAt as number)) {
          const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.GOOGLE_CLIENT_ID!,
              client_secret: process.env.GOOGLE_CLIENT_SECRET!,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken as string,
            }),
          });
          const data = await response.json();
          if (data.access_token) {
            token.accessToken = data.access_token;
            token.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
          }
        }
      } catch (error) {
        console.error('JWT callback error:', error);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/auth/error',
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error('[NextAuth][error]', code, JSON.stringify(metadata, null, 2));
    },
    warn(code) {
      console.warn('[NextAuth][warn]', code);
    },
    debug(code, metadata) {
      console.log('[NextAuth][debug]', code, JSON.stringify(metadata, null, 2));
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend session type
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
