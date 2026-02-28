# Daily.co Video Setup (Token-Based)

Video calling uses **Daily.co** with token-based access. The API key must **never** be exposed client-side.

## Environment Variables (server only)

Add to `.env.local` (and to Vercel → Project → Settings → Environment Variables for production):

```env
DAILY_API_KEY=PASTE_NEW_REVOKED_KEY_HERE
DAILY_DOMAIN=instantteacher.daily.co
DAILY_API_BASE_URL=https://api.daily.co/v1
```

- **Do NOT** prefix `DAILY_API_KEY` with `NEXT_PUBLIC_` — it must stay server-only.
- Get your API key from [Daily Dashboard](https://dashboard.daily.co/) → Developers → API keys.
- Domain `instantteacher.daily.co` is created in the Daily dashboard; create it if needed.

## Flow

1. User clicks **Join video call** from session page or teacher/parent dashboard.
2. Client calls `POST /api/video/create-session` with `{ sessionId, role: "teacher" | "student" }`.
3. Server creates or reuses a Daily room for that session, stores `dailyRoomName` and `dailyRoomUrl` on `TutoringSession`, generates a meeting token (teacher = owner, student = participant), and returns `{ roomUrl, token, roomName }`.
4. Client embeds Daily Prebuilt via iframe: `roomUrl + "?t=" + token`.
5. User sees camera/mic prompt and joins the call.

## Testing

1. Set `DAILY_API_KEY` and `DAILY_DOMAIN` in `.env.local`.
2. Run `npm run dev`, create a tutoring session (or use an existing one).
3. Log in as teacher or parent/student, open the session, click **Join video call**.
4. Confirm Daily Prebuilt loads and you can join. Open a second browser/incognito and join as the other role to verify both see each other.

## Admin video test

Admin → Video test shows whether Daily is configured. To test end-to-end, use a real tutoring session and **Join video call** from the session or dashboard.
