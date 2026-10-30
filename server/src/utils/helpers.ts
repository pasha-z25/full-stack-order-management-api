import type { Request } from 'express';
import { QueryFailedError } from 'typeorm';

import { BadRequestError } from '@/errors/httpError';
import type { RegistrationInput } from '@/types/auth';

import os from 'os';
import {
  EMAIL_PATTERN,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from './constants';

export const getRequestInfo = (req: Request) => ({
  method: req.method,
  url: req.originalUrl || req.url,
  baseUrl: req.baseUrl,
  referer: req.get('Referer'),
  origin: req.get('Origin'),
  userAgent: req.get('User-Agent'),
  secure: req.secure,
  query: req.query,
});

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

export const isUniqueViolation = (error: unknown): boolean => {
  if (!(error instanceof QueryFailedError)) return false;
  const driverError = error.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
};

export const parseRegistration = (input: unknown): RegistrationInput => {
  const body =
    input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email =
    typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const address = typeof body.address === 'string' ? body.address.trim() : '';

  if (name.length < 2) {
    throw new BadRequestError('⚠️ Name must be at least 2 characters');
  }
  if (name.length > 255) {
    throw new BadRequestError('⚠️ Name is too long');
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 255) {
    throw new BadRequestError('⚠️ Email is invalid');
  }
  if (
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    throw new BadRequestError(
      `⚠️ Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`
    );
  }
  if (phone.length > 20) {
    throw new BadRequestError('⚠️ Phone is too long');
  }
  if (address.length > 1000) {
    throw new BadRequestError('⚠️ Address is too long');
  }

  return {
    name,
    email,
    password,
    phone: phone || null,
    address: address || null,
  };
};

export function getRandomInt(min: number, max: number) {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
}

export function getLocalIP(): string | null {
  const interfaces = os.networkInterfaces();
  for (const key in interfaces) {
    for (const net of interfaces[key]!) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

export function serverListenerLogger(PORT: string | number): void {
  const localURL = `http://localhost:${PORT}`;
  const networkIP = getLocalIP();
  const networkURL = networkIP
    ? `http://${networkIP}:${PORT}`
    : 'Not available';

  console.log(
    '\x1b[36m%s\x1b[0m',
    '   Express.js 🚀 Server running successfully'
  );
  console.log(`   - Local:        ${localURL}`);
  console.log(`   - Network:      ${networkURL}`);
  console.log('   ');
}
