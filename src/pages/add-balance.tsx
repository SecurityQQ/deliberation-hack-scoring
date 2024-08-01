import { useState } from 'react';
import { useAccount } from 'wagmi';
import { createWalletClient, custom, parseEther } from 'viem';
import { publicClient } from '@/lib/publicClient'; // Import the public client
import FundsManagerABI from '@/artifacts/contracts/FundsManager.sol/FundsManager.json'; // Adjust the path if necessary
import Layout from '@/components/Layout'; // Import the Layout component
type HexString = `0x${string}`;


const AddBalance = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  const castedContractAddress = contractAddress as HexString;

  const handleAddBalance = async () => {
    if (!isConnected || !address) return;

    const etherAmount = parseFloat(amount) / 3000;
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
      const txHash = await client.writeContract({
        abi: FundsManagerABI.abi,
        address: castedContractAddress,
        functionName: 'depositFunds',
        value: parseEther(etherAmount.toString()), // Convert tokens to ether
      });

      console.log('Transaction sent, hash:', txHash);

      console.log('Waiting for transaction receipt...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      console.log('Transaction receipt:', receipt);
      alert('Balance added successfully!');
    } catch (error: any) {
      console.error('Error adding balance:', error.message);
      alert(`Failed to add balance: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl mb-4">Add Balance</h1>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 mb-4"
          placeholder="Enter amount in ether"
        />
        <button onClick={handleAddBalance} className="bg-blue-500 text-white p-2 rounded">
          Add Balance
        </button>
      </div>
    </Layout>
  );
};

export default AddBalance;
