/**
 * Twilio Video - room creation and token generation.
 * MVP: create room on first join, issue token for student/teacher.
 */

import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// Support both TWILIO_API_KEY and TWILIO_API_KEY_SID (Twilio docs use "API Key SID")
const apiKey = process.env.TWILIO_API_KEY_SID ?? process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_KEY_SECRET ?? process.env.TWILIO_API_SECRET;

const TWILIO_NOT_CONFIGURED_MESSAGE =
  "Twilio credentials not configured. Add TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET (and TWILIO_AUTH_TOKEN for room creation).";

export function getTwilioClient() {
  if (!accountSid || !authToken) throw new Error(TWILIO_NOT_CONFIGURED_MESSAGE);
  return twilio(accountSid, authToken);
}

export async function createRoom(uniqueName: string): Promise<string> {
  const client = getTwilioClient();
  const room = await client.video.v1.rooms.create({
    uniqueName,
    type: "group",
    maxParticipants: 2,
  });
  return room.sid;
}

export function isTwilioConfigured(): boolean {
  return !!(accountSid && authToken && apiKey && apiSecret);
}

export function getTwilioNotConfiguredMessage(): string {
  return TWILIO_NOT_CONFIGURED_MESSAGE;
}

export function getAccessToken(identity: string, roomName: string): string {
  if (!accountSid || !apiKey || !apiSecret) throw new Error(TWILIO_NOT_CONFIGURED_MESSAGE);
  const AccessToken = twilio.jwt.AccessToken;
  const VideoGrant = AccessToken.VideoGrant;
  const token = new AccessToken(accountSid, apiKey, apiSecret, {
    identity,
    ttl: 3600,
  });
  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);
  return token.toJwt();
}

export async function getOrCreateRoomForSession(sessionId: string): Promise<{ roomSid: string; roomName: string }> {
  const roomName = `session-${sessionId}`;
  const client = getTwilioClient();
  try {
    const rooms = await client.video.v1.rooms.list({ uniqueName: roomName, status: "in-progress" });
    if (rooms.length > 0) {
      return { roomSid: rooms[0].sid, roomName };
    }
  } catch {
    // ignore
  }
  const roomSid = await createRoom(roomName);
  return { roomSid, roomName };
}
