import { Response } from 'express';

const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; 

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN, 
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: '/', 
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN,
    path: '/',
  });
}