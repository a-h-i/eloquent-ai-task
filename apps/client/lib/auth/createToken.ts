'use server'

import { Selectable } from 'kysely';
import { Profile } from '@/lib/db/schema';
import assert from 'node:assert';
import { decodeJwt, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { COOKIE_NAME_JWT } from '@/lib/auth/constants';

/**
 * Creates a JSON Web Token (JWT) for a user profile and sets it in the cookie store.
 *
 * @param {Selectable<Profile>} profile - The user's profile object.
 * @return {Promise<string>} A promise that resolves to the generated JWT as a string.
 */
export default async function createToken(profile: Selectable<Profile>): Promise<string> {
  const secret = process.env.JWT_SECRET;
  assert(secret, 'JWT_SECRET is not set');
  const jwt = await new SignJWT({
    sub: profile.username,
  }).setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setIssuer('eloquent')
    .setAudience('eloquent:client')
    .setExpirationTime('4h')
    .sign(new TextEncoder().encode(secret));

  const claims = decodeJwt(jwt);


  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME_JWT, jwt, {
    path: '/',
    sameSite: 'strict',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.max(0, claims.exp! - Math.floor(Date.now() / 1000))
  });

  return jwt;
}