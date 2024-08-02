import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { generateDeliberationMap } from '@/lib/generateDeliberationMap';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { content, wallet, weight, premium, rating } = req.body;

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
      rating, // Add the rating field here
    },
  });

  // Generate the deliberation map after the comment is created
  try {
    await generateDeliberationMap(Number(id));
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Error generating deliberation map', error: error.message });
  }

  res.status(200).json(newComment);
};

export default handler;
