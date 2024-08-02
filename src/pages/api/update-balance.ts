import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { address, amount, txHash } = req.body;

    try {
      const user = await prisma.user.upsert({
        where: { wallet: address },
        update: { balance: { increment: amount } },
        create: { wallet: address, balance: 10 + amount }, // default balance + added amount
      });

      // Save the transaction hash with a notice
      await prisma.notice.create({
        data: {
          wallet: address,
          txHash,
          notice: `Funds added: ${amount} ETH`
        }
      });

      res.status(200).json({ balance: user.balance });
    } catch (error) {
      console.error('Error updating balance:', error);
      res.status(500).json({ error: 'Failed to update balance' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
