import { createHash, randomBytes } from 'node:crypto';
const TOKEN_RE = /^[A-Za-z0-9_-]{40,256}$/;
export const generateSecretToken = () => randomBytes(32).toString('base64url');
export const hashSecretToken = (token: string) => createHash('sha256').update(token, 'utf8').digest('hex');
export const isPlausibleToken = (token: unknown): token is string => typeof token === 'string' && TOKEN_RE.test(token);