import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import fs from 'fs';
import upload from '../middleware/cv';

const prisma = new PrismaClient();

export const create = async (req: Request, res: Response) => {
  try {
    upload.single('cv')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const user_id = req.user.id;
      const cvPath = req.file?.path;

      if (!cvPath) {
        return res.status(400).json({ error: 'CV file is missing' });
      }

      const cv = await prisma.cv.create({
        data: {
          cv_data: cvPath,
          user_id: user_id,
        },
      });

      return res.status(201).json(cv);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to create cv' });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id;

    const cv = await prisma.cv.findMany({
      where: { user_id: +user_id },
    });

    return res.status(200).json(cv);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get cv' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    upload.single('cv')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const cvPath = req.file?.path;

      if (!cvPath) {
        return res.status(400).json({ error: 'CV file is missing' });
      }

      const { id } = req.params;
      const user_id = req.user.id;

      const old = await prisma.cv.findUnique({
        where: { id: +id },
      });

      if (!old) {
        return res.status(404).json({ error: 'cv not found' });
      }

      const cv = await prisma.cv.update({
        where: { id: +id, user_id: +user_id },
        data: { cv_data: cvPath },
      });

      // Delete the old CV
      fs.unlinkSync(old.cv_data);

      return res.status(200).json(cv);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to update cv' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const find = await prisma.cv.findUnique({
      where: { id: +id },
    });

    if (!find) {
      return res.status(404).json({ error: 'cv not found' });
    }

    const cv = await prisma.cv.delete({
      where: { id: +id, user_id: +user_id },
    });

    if (find.cv_data) {
      // Delete the cv file
      fs.unlinkSync(find.cv_data);
    }

    return res.status(200).json(cv);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to remove cv' });
  }
};
