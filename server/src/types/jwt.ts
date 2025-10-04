import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export type MyJwtPayload = BaseJwtPayload & {
  sub: number;
  email: string;
};
