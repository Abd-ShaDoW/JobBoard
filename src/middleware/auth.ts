import JWT, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface MyJwtPayload {
  id: number;
  userName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userName: string;
      };
    }
  }
}

export const authMiddleWare = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    throw Error('no token provided');
  }

  const token = auth.split(' ')[1];
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET) as MyJwtPayload;
    const { id, userName } = decoded;
    req.user = {
      id: id,
      userName,
    };
    next();
  } catch (e) {
    console.error('jwt verfication error:', e);
  }
};
