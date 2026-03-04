# Supermail — Email as a Todo List

A keyboard-first email client inspired by [Superhuman](https://superhuman.com), built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Google OAuth Login** — Sign in with your Gmail account
- **Split Inbox** — Automatically categorizes emails into Important, Notifications, Newsletters, Other
- **Keyboard-First** — Navigate entirely with keyboard shortcuts (J/K, E to archive, S to star, etc.)
- **Command Palette** — Cmd+K to access any action instantly
- **Snooze** — Snooze emails to reappear later
- **Undo** — Press Z to undo any action
- **Dark Theme** — Minimalist dark UI

## Setup

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Gmail API**:
   - Navigate to APIs & Services > Library
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Add Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.vercel.app/api/auth/callback/google` (production)
5. Configure OAuth consent screen:
   - Go to APIs & Services > OAuth consent screen
   - Fill in app name, user support email
   - Add scopes: `gmail.readonly`, `gmail.modify`, `gmail.compose`, `gmail.send`
   - Add your email as a test user (while in testing mode)

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://localhost:3000
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `J` / `K` | Navigate down / up |
| `Enter` | Open email / Reply All |
| `E` | Archive (Mark Done) |
| `S` | Star / Unstar |
| `H` | Snooze |
| `R` | Reply |
| `F` | Forward |
| `C` | Compose |
| `#` | Trash |
| `/` | Search |
| `Cmd+K` | Command Palette |
| `Z` | Undo |
| `Tab` | Next split category |
| `?` | Show all shortcuts |
| `Esc` | Close / Go back |

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URI with your Vercel URL

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **NextAuth.js** (Google OAuth)
- **Gmail API**
- **Zustand** (State management)
- **DOMPurify** (HTML sanitization)
