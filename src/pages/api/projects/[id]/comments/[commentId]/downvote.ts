import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { boostValue } = req.body;
    const { id, commentId } = req.query;

    // Update the comment's weight
    const updatedComment = await prisma.comment.update({
      where: { id: Number(commentId) },
      data: {
        weight: {
          decrement: boostValue,
        },
      },
    });

    return res.status(200).json(updatedComment);
  }

  return res.status(405).end();
}
