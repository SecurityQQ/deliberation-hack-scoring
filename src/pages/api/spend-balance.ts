import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, amount } = req.body;

  if (req.method === 'POST') {
    try {
      let user = await prisma.user.findUnique({
        where: { wallet: address },
      });

      if (!user) {
        // If user doesn't exist, create a new user with an initial balance
        user = await prisma.user.create({
          data: {
            wallet: address,
          },
        });
      }

      if (user.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }

      const updatedUser = await prisma.user.update({
        where: { wallet: address },
        data: { balance: { decrement: amount } },
      });

      res.status(200).json({ balance: updatedUser.balance });
    } catch (error) {
      console.error('Error spending balance:', error);
      res.status(500).json({ error: 'Failed to spend balance' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
