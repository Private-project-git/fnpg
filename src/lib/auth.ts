// src/lib/auth.ts

const encoder = new TextEncoder();

function base64urlEncode(str: string): string {
  return btoa(str)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a session payload using HMAC-SHA256
 */
export async function signSession(payload: any, secret: string, expiresInMs = 24 * 60 * 60 * 1000): Promise<string> {
  const exp = Date.now() + expiresInMs;
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = base64urlEncode(JSON.stringify({ ...payload, exp }));
  
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${header}.${payloadStr}`)
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  let signatureString = '';
  for (let i = 0; i < signatureBytes.length; i++) {
    signatureString += String.fromCharCode(signatureBytes[i]);
  }
  
  const signature = base64urlEncode(signatureString);
  return `${header}.${payloadStr}.${signature}`;
}

/**
 * Verifies a signed session token
 */
export async function verifySession(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payloadStr, signature] = parts;
    const key = await getCryptoKey(secret);
    const data = encoder.encode(`${header}.${payloadStr}`);
    
    const binarySign = base64urlDecode(signature);
    const signBytes = new Uint8Array(binarySign.length);
    for (let i = 0; i < binarySign.length; i++) {
      signBytes[i] = binarySign.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify('HMAC', key, signBytes, data);
    if (!isValid) return null;
    
    const payload = JSON.parse(base64urlDecode(payloadStr));
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (err) {
    return null;
  }
}
