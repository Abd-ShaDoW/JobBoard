import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();
import upload from '../middleware/image';
import fs from 'fs';

export const getAll = async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.jobs.findMany({
      where: {
        company_id: req.body.company_id,
      },
    });

    return res.status(200).json(jobs);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get jobs' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await prisma.jobs.findUnique({
      where: {
        id: +id,
      },
    });

    res.status(200).json(job);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to get job' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    upload.single('image')(req, res, async (err: any) => {
      if (err) {
        return res
          .status(500)
          .json({ error: 'Failed to upload profile picture' });
      }

      const imagePath = req.file ? req.file.path : null;

      const { title, experiance, description, company_id } = req.body;

      // Check if the user owns the company
      const company = await prisma.company.findUnique({
        where: { id: +company_id },
        select: { owner_id: true },
      });

      const user_id = req.user.id;

      if (company.owner_id !== +user_id) {
        return res
          .status(403)
          .json({ error: 'not authorized to post in this company' });
      }

      const job = await prisma.jobs.create({
        data: {
          title: title,
          experiance: experiance,
          description: description,
          company_id: +company_id,
          user_id: +user_id,
          image: imagePath,
        },
      });

      return res.status(201).json(job);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to create job' });
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
      const { title, experiance, description, company_id } = req.body;

      const old = await prisma.jobs.findUnique({
        where: { id: +id, company_id: +company_id },
      });

      const job = await prisma.jobs.update({
        where: { id: +id, company_id: +company_id },
        data: {
          title: title,
          experiance: experiance,
          description: description,
          image: imagePath,
        },
      });

      if (imagePath && fs.existsSync(old.image)) {
        fs.unlinkSync(old.image);
      }

      return res.status(200).json(job);
    });
  } catch (e) {
    return res.status(500).json({ e: 'Failed to update job' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const post = await prisma.jobs.findUnique({ where: { id: +id } });

    if (!post) {
      return res.status(404).json({ error: 'job not found' });
    }

    const job = await prisma.jobs.delete({
      where: {
        id: +id,
        company_id: req.body.company_id,
        user_id: user_id,
      },
    });

    if (fs.existsSync(post.image)) {
      // Delete the image file from the storage after removing the job post
      fs.unlinkSync(post.image);
    }

    return res.status(200).json(job);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to delete job' });
  }
};

export const applyTojob = async (req: Request, res: Response) => {
  try {
    const { job_id, cv_id } = req.body;

    const existingApplicant = await prisma.applicants.findFirst({
      where: {
        cv_id: +cv_id,
        job_id: +job_id,
      },
    });

    if (existingApplicant) {
      return res.status(400).json({ e: 'User already applied to this job.' });
    }

    const cv = await prisma.cv.findUnique({
      where: { id: cv_id, user_id: req.user.id },
    });

    if (!cv) {
      return res.json({ e: 'Cv dosnt exist' });
    }

    const newApplicant = await prisma.applicants.create({
      data: {
        cv_id: +cv_id,
        job_id: +job_id,
      },
    });

    return res.status(201).json(newApplicant);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to apply to the job' });
  }
};

export const listApplicants = async (req: Request, res: Response) => {
  try {
    const { job_id } = req.body;

    const list = await prisma.applicants.findMany({
      where: {
        job_id: +job_id,
      },
      include: {
        cv: {
          select: {
            user: {
              select: { userName: true, image: true },
            },
          },
        },
      },
    });
    res.status(200).json(list);
  } catch (e) {
    return res.status(500).json({ e: 'Failed to list job applicants' });
  }
};
