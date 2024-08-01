// pages/api/projects.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, description, image, owner } = req.body;

    if (!title || !description || !image || !owner) {
      console.log('Missing required fields:', { title, description, image, owner });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const project = await prisma.project.create({
        data: {
          title,
          description,
          image,
          owner,
        },
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: 'Error creating project' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
