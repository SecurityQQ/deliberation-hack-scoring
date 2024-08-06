// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { walletAddress } = req.body;

    try {
      const user = await prisma.user.upsert({
        where: { wallet: walletAddress },
        update: {},
        create: { wallet: walletAddress, balance: 10.0 },
      });
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
