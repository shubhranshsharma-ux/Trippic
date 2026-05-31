import crypto from 'crypto';

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET ?? 'default-secret-change-me-in-production';
  return Buffer.from(secret.slice(0, 64), 'hex').slice(0, 32);
}

export function encryptSession(data: object): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Return iv:authTag:ciphertext as base64url joined by '.'
  return [
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptSession(token: string): object | null {
  try {
    const key = getKey();
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [ivB64, authTagB64, encryptedB64] = parts;
    const iv = Buffer.from(ivB64, 'base64url');
    const authTag = Buffer.from(authTagB64, 'base64url');
    const encrypted = Buffer.from(encryptedB64, 'base64url');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch {
    return null;
  }
}
