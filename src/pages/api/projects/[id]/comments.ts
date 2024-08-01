// pages/api/projects/[id]/comments.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { id } = req.query;
    const { content, wallet, weight, premium } = req.body;

    if (!wallet) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }

    // Check if user is the project owner
    const project = await prisma.project.findUnique({
      where: { id: Number(id) },
    });

    if (project.owner === wallet) {
      return res.status(400).json({ message: 'You cannot comment on your own project' });
    }

    // Check if the user has already left a free comment
    const userComments = await prisma.comment.findMany({
      where: {
        projectId: Number(id),
        wallet,
      },
    });

    const freeComments = userComments.filter(comment => !comment.premium);

    if (freeComments.length >= 1 && !premium) {
      return res.status(400).json({ message: 'You have already left a free comment' });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        projectId: Number(id),
        wallet,
        weight,
        premium,
      },
    });

    res.status(200).json(newComment);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
