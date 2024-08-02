import { useState } from 'react';
import { useAccount } from 'wagmi';
import { createWalletClient, custom, parseEther } from 'viem';
import { publicClient } from '@/lib/publicClient'; // Import the public client
import FundsManagerABI from '@/artifacts/contracts/FundsManager.sol/FundsManager.json'; // Adjust the path if necessary
import Layout from '@/components/Layout'; // Import the Layout component
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

type HexString = `0x${string}`;

const AddBalance = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  const castedContractAddress = contractAddress as HexString;

  const handleAddBalance = async () => {
    if (!isConnected || !address) return;

    const etherAmount = amount / 3000;
    if (isNaN(etherAmount) || etherAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      console.log('Creating wallet client...');
      const client = createWalletClient({
        chain: publicClient.chain, // Use the same chain as the public client
        transport: custom(window.ethereum),
        account: address
      });

      console.log('Sending transaction...');
      setIsSubmitting(true);
      toast({
        title: "Transaction Submitted",
        description: "Check wallet for next steps.",
      });

      const txHash = await client.writeContract({
        abi: FundsManagerABI.abi,
        address: castedContractAddress,
        functionName: 'depositFunds',
        value: parseEther(etherAmount.toString()), // Convert tokens to ether
      });

      toast({
        title: "Transaction Hash",
        description: `Hash: ${txHash}`,
      });

      console.log('Transaction sent, hash:', txHash);

      console.log('Waiting for transaction receipt...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      console.log('Transaction receipt:', receipt);

      console.log('Updating backend with transaction details...');
      await axios.post('/api/update-balance', {
        address,
        amount, // Send amount in $
        txHash,
      });

      toast({
        title: "Balance Added",
        description: "Balance added successfully!",
      });
    } catch (error: any) {
      console.error('Error adding balance:', error.message);
      toast({
        title: "Error",
        description: `Failed to add balance: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const incrementAmount = () => setAmount((prev) => Math.min(prev + 10, 1000));
  const decrementAmount = () => setAmount((prev) => Math.max(prev - 10, 10));

  const handlePresetAmount = (dollarAmount: number) => {
    setAmount(dollarAmount);
  };

  return (
  <Layout>
    <div className="container mx-auto p-4 bg-card text-card-foreground rounded-lg shadow-md">
      <div className="flex flex-col justify-center">
        <h1 className="text-3xl mb-4 text-center">👾 Add Balance 👾</h1>
        <p className="mb-4 text-center">This money will be used to increase the total prize fund for a hackathon. Optimism ETH deposit supported</p>
        <div className="flex justify-center space-x-2 mb-4">
          <Button onClick={() => handlePresetAmount(10)} variant="outline">$10</Button>
          <Button onClick={() => handlePresetAmount(20)} variant="outline">$20</Button>
          <Button onClick={() => handlePresetAmount(50)} variant="outline">$50</Button>
        </div>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={decrementAmount}
            disabled={isSubmitting || amount <= 10}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <div className="text-2xl font-bold">{`$${amount}`}</div>
          <Button
            variant="outline"
            size="icon"
            onClick={incrementAmount}
            disabled={isSubmitting || amount >= 1000}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={handleAddBalance}
            variant="outline"
            disabled={isSubmitting}
            className="w-48"
          >
            {isSubmitting ? 'Submitting...' : '👾 Add Balance'}
          </Button>
        </div>
      </div>
    </div>
  </Layout>
);
};

export default AddBalance;
