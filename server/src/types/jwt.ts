import { JwtPayload as BaseJwtPayload } from 'jsonwebtoken';

export type MyJwtPayload = BaseJwtPayload & {
  sub: string;
  email: string;
};
