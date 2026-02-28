/**
 * Daily.co video — server-only. API key must never be exposed client-side.
 * Uses fetch to call Daily REST API: create room, create meeting token.
 */

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN ?? "instantteacher.daily.co";
const DAILY_API_BASE_URL = process.env.DAILY_API_BASE_URL ?? "https://api.daily.co/v1";

const DAILY_NOT_CONFIGURED_MESSAGE =
  "Daily credentials not configured. Add DAILY_API_KEY and DAILY_DOMAIN to environment variables.";

function getAuthHeader(): string {
  if (!DAILY_API_KEY) throw new Error(DAILY_NOT_CONFIGURED_MESSAGE);
  return `Bearer ${DAILY_API_KEY}`;
}

/** Room name must be A-Za-z0-9_- only (max 128 chars). */
function sanitizeRoomName(sessionId: string): string {
  const base = `session-${sessionId}`.replace(/[^A-Za-z0-9_-]/g, "_");
  return base.slice(0, 128);
}

export function isDailyConfigured(): boolean {
  return !!(DAILY_API_KEY && DAILY_DOMAIN);
}

export function getDailyNotConfiguredMessage(): string {
  return DAILY_NOT_CONFIGURED_MESSAGE;
}

export type CreateRoomResult = {
  name: string;
  url: string;
  config?: { enable_prejoin_ui?: boolean };
};

/**
 * Create a Daily room for admin testing (no name — Daily auto-generates).
 * SERVER ONLY. Use DAILY_API_BASE_URL (api.daily.co), not DAILY_DOMAIN.
 */
export async function createDailyRoom(): Promise<{ name: string; url: string }> {
  if (!process.env.DAILY_API_KEY) throw new Error("DAILY_API_KEY missing");
  if (!process.env.DAILY_API_BASE_URL) throw new Error("DAILY_API_BASE_URL missing");

  try {
    const res = await fetch(`${process.env.DAILY_API_BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: false,
          start_video_off: false,
          lang: "en",
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Daily API error response:", text);
      throw new Error("Daily API returned non-OK status");
    }

    return res.json();
  } catch (err) {
    console.error("Daily API request failed:", err);
    throw err;
  }
}

/**
 * Create a Daily room with a specific name (for tutoring sessions).
 * POST /rooms
 */
export async function createDailyRoomWithName(roomName: string): Promise<CreateRoomResult> {
  getAuthHeader();
  const res = await fetch(`${DAILY_API_BASE_URL}/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        enable_prejoin_ui: true,
        start_audio_off: false,
        start_video_off: false,
      },
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Daily create room failed: ${res.status}`);
  }
  const data = (await res.json()) as { name: string; url: string; config?: { enable_prejoin_ui?: boolean } };
  return { name: data.name, url: data.url, config: data.config };
}

/**
 * Get existing room. GET /rooms/:name
 */
export async function getDailyRoom(roomName: string): Promise<CreateRoomResult | null> {
  getAuthHeader();
  const res = await fetch(`${DAILY_API_BASE_URL}/rooms/${encodeURIComponent(roomName)}`, {
    headers: { Authorization: getAuthHeader() },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Daily get room failed: ${res.status}`);
  const data = (await res.json()) as { name: string; url: string; config?: { enable_prejoin_ui?: boolean } };
  return { name: data.name, url: data.url, config: data.config };
}

/**
 * Create a meeting token for a participant. Teacher = owner (moderator), student = participant.
 * POST /meeting-tokens
 */
export async function createDailyMeetingToken(params: {
  roomName: string;
  role: "teacher" | "student";
  userId: string;
  userName: string;
  expSeconds?: number;
}): Promise<string> {
  getAuthHeader();
  const exp = params.expSeconds ?? 4 * 60 * 60; // 4 hours default
  const expUnix = Math.floor(Date.now() / 1000) + exp;
  const res = await fetch(`${DAILY_API_BASE_URL}/meeting-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      properties: {
        room_name: params.roomName,
        user_id: params.userId.slice(0, 36),
        user_name: params.userName,
        is_owner: params.role === "teacher",
        exp: expUnix,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Daily create token failed: ${res.status}`);
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

/**
 * Get or create a Daily room for a tutoring session. Returns room name and URL.
 */
export async function getOrCreateDailyRoomForSession(sessionId: string): Promise<{
  roomName: string;
  roomUrl: string;
}> {
  const roomName = sanitizeRoomName(sessionId);
  const existing = await getDailyRoom(roomName);
  if (existing) return { roomName: existing.name, roomUrl: existing.url };
  const created = await createDailyRoomWithName(roomName);
  return { roomName: created.name, roomUrl: created.url };
}

/**
 * Update a Daily room's expiration time.
 * PUT /rooms/:name
 */
export async function updateDailyRoomExpiration(roomName: string, newEndTime: Date): Promise<void> {
  getAuthHeader();
  const expUnix = Math.floor(newEndTime.getTime() / 1000);
  const res = await fetch(`${DAILY_API_BASE_URL}/rooms/${encodeURIComponent(roomName)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify({
      properties: {
        exp: expUnix,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `Daily update room expiration failed: ${res.status}`);
  }
}
