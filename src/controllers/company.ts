import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();
import upload from '../middleware/image';
import fs from 'fs';

export const create = async (req: Request, res: Response) => {
  try {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Failed to upload profile picture' });
      }

      const imagePath = req.file ? req.file.path : null;

      const used = await prisma.company.findFirst({
        where: { name: req.body.name },
      });
      if (used) {
        return new Error('try another name');
      }

      const company = await prisma.company.create({
        data: {
          name: req.body.name,
          location: req.body.location,
          owner_id: req.user.id,
          image: imagePath,
        },
      });

      return res.status(201).json(company);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to create company' });
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

      const imagePath = req.file?.path;
      const { id } = req.params;
      const user_id = req.user.id;

      const old = await prisma.company.findUnique({
        where: { id: +id, owner_id: +user_id },
      });

      const company = await prisma.company.update({
        where: {
          id: +id,
          owner_id: +user_id,
        },
        data: {
          name: req.body.name,
          image: imagePath,
        },
      });

      if (imagePath && fs.existsSync(old.image)) {
        fs.unlinkSync(old.image);
      }

      return res.status(200).json(company);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to update company' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: {
        id: +id,
      },
    });

    return res.status(200).json(company);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get company' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.delete({
      where: { id: +id, owner_id: req.user.id },
    });

    if (fs.existsSync(company.image)) {
      fs.unlinkSync(company.image);
    }
    return res.status(200).json(company);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to remove company' });
  }
};
