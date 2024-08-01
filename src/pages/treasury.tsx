import { useEffect, useState } from 'react';
import Layout from "@/components/Layout";
import { ethers } from 'ethers';

// Import the ABI from the compiled contract
import contractABI from '@/artifacts/contracts/CommentPayment.sol/CommentPayment.json';

// Use environment variable for contract address
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const Treasury = () => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI.abi, provider);
      const balance = await contract.getBalance();
      setBalance(ethers.utils.formatEther(balance));
    };

    fetchBalance();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Treasury Balance</h1>
        <p className="text-lg">Total Balance: {balance} ETH</p>
      </div>
    </Layout>
  );
};

export default Treasury;
