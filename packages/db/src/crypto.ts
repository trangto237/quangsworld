/**
 * Local content encryption (PRD §12): the SQLite file and uploaded materials are
 * encrypted at rest with AES-GCM using a non-extractable per-device key.
 * Parent passwords and kid PINs are stored only as PBKDF2 hashes.
 */

export async function generateDeviceKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export interface Sealed {
  iv: Uint8Array;
  data: Uint8Array;
}

export async function seal(key: CryptoKey, plain: Uint8Array): Promise<Sealed> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, plain as BufferSource));
  return { iv, data };
}

export async function open(key: CryptoKey, sealed: Sealed): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: sealed.iv as BufferSource }, key, sealed.data as BufferSource));
}

const hex = (b: Uint8Array) => [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (s: string) => new Uint8Array(s.match(/../g)!.map((h) => parseInt(h, 16)));

export async function hashSecret(secret: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const salt = saltHex ? unhex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret) as BufferSource, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: 120_000 }, base, 256);
  return { hash: hex(new Uint8Array(bits)), salt: hex(salt) };
}

export async function verifySecret(secret: string, hash: string, salt: string): Promise<boolean> {
  const h = await hashSecret(secret, salt);
  // Constant-time-ish comparison.
  let diff = h.hash.length ^ hash.length;
  for (let i = 0; i < Math.min(h.hash.length, hash.length); i++) diff |= h.hash.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}
