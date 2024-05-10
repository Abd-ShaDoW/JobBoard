import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { authSchema } from '../helpers/validate';
import JWT from 'jsonwebtoken';
import upload from '../middleware/image';
import fs from 'fs';

const prisma = new PrismaClient();

export const signUp = async (req: Request, res: Response) => {
  try {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Failed to upload profile picture' });
      }

      const imagePath = req.file ? req.file.path : null;

      const result = await authSchema.validateAsync(req.body);
      const used = await prisma.user.findFirst({
        where: { email: req.body.email },
      });
      if (used) {
        return new Error('email already used');
      }

      const user = await prisma.user.create({
        data: {
          email: result.email,
          userName: result.userName,
          password: await bcrypt.hash(result.password, 10),
          image: imagePath,
        },
      });

      return res.status(201).json(user);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to signup' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw Error('Please provide email and password');
    }

    const user = await prisma.user.findFirst({
      where: { email: req.body.email },
    });
    if (!user) {
      return new Error('invalid credentials');
    }

    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return new Error('invalid password');
    }
    const token = JWT.sign(
      {
        id: user.id,
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    return res.status(200).json({ user, token });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to signin' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Failed to upload profile picture' });
      }

      const imagePath = req.file ? req.file.path : null;
      const user_id = req.user.id;

      const old = await prisma.user.findUnique({
        where: { id: +user_id },
      });

      const user = await prisma.user.update({
        where: { id: +user_id },
        data: {
          userName: req.body.userName,
          image: imagePath,
        },
      });

      if (old.image && imagePath) {
        if (fs.existsSync(old.image)) {
          fs.unlinkSync(old.image);
        }
      }
      return res.status(200).json(user);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to update user profile' });
  }
};
