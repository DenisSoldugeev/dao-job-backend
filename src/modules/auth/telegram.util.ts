import { createHmac } from 'crypto';
import { UnauthorizedException } from '@nestjs/common';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
): TelegramUser {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    throw new UnauthorizedException('Missing hash');
  }

  params.delete('hash');

  // Sort params and create data-check-string
  const dataCheckArr: string[] = [];
  params.forEach((value, key) => {
    dataCheckArr.push(`${key}=${value}`);
  });
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join('\n');

  // Create secret key from bot token
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();

  // Calculate hash
  const calculatedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    throw new UnauthorizedException('Invalid hash');
  }

  // Check auth_date (valid for 24 hours)
  const authDate = Number(params.get('auth_date'));
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - authDate > 86400) {
    throw new UnauthorizedException('Auth data expired');
  }

  // Parse user data
  const userJson = params.get('user');
  if (!userJson) {
    throw new UnauthorizedException('Missing user data');
  }

  try {
    const user = JSON.parse(userJson) as TelegramUser;
    user.hash = hash;
    user.auth_date = authDate;
    return user;
  } catch {
    throw new UnauthorizedException('Invalid user data');
  }
}
