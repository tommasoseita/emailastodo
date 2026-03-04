# Superhuman Email Clone - Piano di Implementazione

## Tech Stack
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS (UI minimale, scuro, veloce)
- **Auth**: NextAuth.js con Google OAuth (accesso Gmail)
- **Email API**: Gmail API via Google APIs
- **State**: Zustand (leggero e veloce)
- **Deploy-ready**: tutto in un monorepo Next.js

## Funzionalità Core (MVP)

### 1. Autenticazione Google
- Login con Google OAuth 2.0
- Permessi Gmail (lettura, invio, modifica, labels)
- Sessione persistente

### 2. Inbox con Split Inbox
- **Important** — email da contatti VIP / risposte dirette
- **Notifications** — notifiche da servizi (GitHub, Jira, ecc.)
- **Newsletters** — email promozionali/newsletter
- **Other** — tutto il resto
- Navigazione tra split con Tab/Shift+Tab

### 3. Lista Email
- Vista lista compatta (mittente, oggetto, anteprima, data)
- Navigazione con J/K (su/giù)
- Selezione con Enter per aprire
- Thread view con tutti i messaggi

### 4. Lettura Email
- Pannello di lettura a destra (layout 3 colonne: sidebar, lista, lettura)
- Rendering HTML sicuro delle email
- Espansione messaggi nel thread

### 5. Azioni Email (Keyboard-First)
- **E** — Archivia (Mark Done)
- **H** — Snooze (Remind Me) con picker data
- **S** — Star
- **R** — Reply
- **F** — Forward
- **C** — Compose nuova email
- **Enter** — Reply All
- **#** — Trash
- **/** — Search
- **Cmd+K** — Command palette
- **Z** — Undo ultima azione
- **?** — Mostra shortcuts

### 6. Composizione Email
- Editor rich text (bold, italic, link)
- To, Cc, Bcc
- Invio con Cmd+Enter
- Salvataggio bozze automatico

### 7. Snooze
- Snooze email per after (stasera, domani, prossima settimana, data custom)
- Email riappare in inbox alla data scelta

### 8. Search
- Ricerca full-text nelle email
- Filtri (from, to, subject, has:attachment)

### 9. Command Palette (Cmd+K)
- Cerca azioni per nome
- Esegui qualsiasi azione dalla palette
- Mostra shortcut associato

### 10. UI/UX
- Tema scuro (come Superhuman)
- Animazioni fluide (< 100ms)
- Zero bright colors, design minimale
- Sidebar sinistra con: Inbox, Starred, Snoozed, Sent, Drafts, Trash
- Status bar in basso con shortcut contestuali

## Struttura File

```
emailastodo/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (dark theme)
│   │   ├── page.tsx            # Landing/login page
│   │   ├── mail/
│   │   │   ├── layout.tsx      # Mail app layout (3 colonne)
│   │   │   └── page.tsx        # Main mail view
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── emails/route.ts
│   │       ├── emails/[id]/route.ts
│   │       ├── emails/send/route.ts
│   │       └── emails/snooze/route.ts
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── EmailList.tsx
│   │   ├── EmailRow.tsx
│   │   ├── EmailView.tsx
│   │   ├── ComposeModal.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── SplitInboxTabs.tsx
│   │   ├── SnoozePopover.tsx
│   │   ├── SearchBar.tsx
│   │   ├── ShortcutsHelp.tsx
│   │   └── StatusBar.tsx
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useEmails.ts
│   │   └── useGmail.ts
│   ├── lib/
│   │   ├── gmail.ts            # Gmail API client
│   │   ├── auth.ts             # NextAuth config
│   │   └── classify.ts         # Split inbox classification
│   ├── store/
│   │   └── emailStore.ts       # Zustand store
│   └── types/
│       └── email.ts
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.example
```

## Fasi di Sviluppo

### Fase 1: Setup + Auth
- Scaffold Next.js + Tailwind
- Google OAuth con NextAuth.js
- Permessi Gmail API

### Fase 2: Core Email UI
- Layout 3 colonne (sidebar, lista, lettura)
- Fetch email da Gmail API
- Rendering lista email
- Lettura email singola

### Fase 3: Azioni + Shortcuts
- Keyboard shortcuts globali
- Archivia, Star, Trash
- Snooze con date picker
- Undo

### Fase 4: Split Inbox + Search
- Classificazione automatica email
- Tab per categorie
- Ricerca con filtri

### Fase 5: Compose + Command Palette
- Editor composizione
- Command palette (Cmd+K)
- Shortcuts help modal
