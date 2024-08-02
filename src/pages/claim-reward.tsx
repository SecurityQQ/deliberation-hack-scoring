import { useState } from 'react';
import Layout from "@/components/Layout";
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import WalletButton from '@/components/WalletButton';

// Import the ABI from the compiled contract
import contractABI from '@/artifacts/contracts/CommentPayment.sol/CommentPayment.json';

// Use environment variable for contract address
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const ClaimReward = () => {
  const { address, isConnected } = useAccount();
  const [winner, setWinner] = useState('');

  const handleClaimReward = async () => {
    if (!isConnected) return alert('Please connect your wallet.');

    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress as string, contractABI.abi, signer);

    try {
      const tx = await contract.claimReward(winner);
      await tx.wait();
      alert('Reward claimed successfully.');
    } catch (error) {
      console.error(error);
      alert('Failed to claim reward.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Claim Reward</h1>
        <input
          type="text"
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          placeholder="Enter winner's wallet address"
          className="border rounded w-full p-2 mb-4"
        />
        {!isConnected ? (
          <WalletButton />
        ) : (
          <button
            onClick={handleClaimReward}
            className="bg-green-500 text-white rounded px-4 py-2"
          >
            Claim Reward
          </button>
        )}
      </div>
    </Layout>
  );
};

export default ClaimReward;
