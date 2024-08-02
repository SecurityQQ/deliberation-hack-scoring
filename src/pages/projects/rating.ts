// pages/api/projects/[id]/rating.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { rating, wallet } = req.body;

  if (req.method === 'POST') {
    try {
      const project = await prisma.project.findUnique({
        where: { id: Number(id) },
      });

      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const existingRatings = project.ratings || {};

      existingRatings[wallet] = rating;

      const updatedProject = await prisma.project.update({
        where: { id: Number(id) },
        data: {
          ratings: existingRatings,
        },
      });

      return res.status(200).json(updatedProject);
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
