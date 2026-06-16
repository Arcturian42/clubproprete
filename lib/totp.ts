import crypto from "crypto";

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(str: string): Buffer {
  const map = new Map(BASE32_CHARS.split("").map((c, i) => [c, i]));
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of str.toUpperCase()) {
    const val = map.get(char);
    if (val === undefined) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

export function getTotpUri(secret: string, email: string, issuer = "Club Propreté"): string {
  const label = encodeURIComponent(email);
  const iss = encodeURIComponent(issuer);
  return `otpauth://totp/${iss}:${label}?secret=${secret}&issuer=${iss}&algorithm=SHA1&digits=6&period=30`;
}

function hmacSha1(key: Buffer, message: Buffer): Buffer {
  return crypto.createHmac("sha1", key).update(message).digest();
}

export function generateTotpCode(secret: string, timestamp = Date.now()): string {
  const key = base32Decode(secret);
  const time = Math.floor(timestamp / 30000);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(time), 0);
  const hmac = hmacSha1(key, timeBuffer);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

export function verifyTotpCode(secret: string, code: string, windowSteps = 1): boolean {
  const now = Date.now();
  for (let i = -windowSteps; i <= windowSteps; i++) {
    if (generateTotpCode(secret, now + i * 30000) === code) {
      return true;
    }
  }
  return false;
}
