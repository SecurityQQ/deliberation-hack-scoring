import { useEffect, useState } from 'react';
import Layout from "@/components/Layout";
import { useAccount } from 'wagmi';
import { createWalletClient, custom, parseEther, formatEther } from 'viem';
import { publicClient } from "@/lib/publicClient";
import FundsManagerABI from '@/artifacts/contracts/FundsManager.sol/FundsManager.json';

// Cast contract address to HexString
type HexString = `0x${string}`;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const castedContractAddress = contractAddress as HexString;

const Treasury = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState('');
  const [withdrawalLimit, setWithdrawalLimit] = useState(0);
  const [newLimit, setNewLimit] = useState('');

  useEffect(() => {
    const fetchBalanceAndLimit = async () => {
      try {
        const [balance, limit] = await Promise.all([
          publicClient.readContract({
            abi: FundsManagerABI.abi,
            address: castedContractAddress,
            functionName: 'getBalance',
          }),
          publicClient.readContract({
            abi: FundsManagerABI.abi,
            address: castedContractAddress,
            functionName: 'getWithdrawalLimit',
          }),
        ]);
        setBalance(parseFloat(formatEther(balance)));
        setWithdrawalLimit(parseFloat(formatEther(limit)));
      } catch (error) {
        console.error("Failed to fetch balance or limit:", error);
      }
    };

    const checkRole = async () => {
      if (!address) return;

      try {
        const [superAdmin, withdrawalPerson] = await Promise.all([
          publicClient.readContract({
            abi: FundsManagerABI.abi,
            address: castedContractAddress,
            functionName: 'superAdmin',
          }),
          publicClient.readContract({
            abi: FundsManagerABI.abi,
            address: castedContractAddress,
            functionName: 'withdrawalPerson',
          }),
        ]);

        if (address === superAdmin) {
          setRole('superAdmin');
        } else if (address === withdrawalPerson) {
          setRole('withdrawalPerson');
        }
      } catch (error) {
        console.error("Failed to check role:", error);
      }
    };

    fetchBalanceAndLimit();
    checkRole();
  }, [address]);

  const handleSetLimit = async () => {
    if (role !== 'superAdmin') return;

    try {
      const client = createWalletClient({
        chain: publicClient.chain,
        transport: custom(window.ethereum),
        account: address as HexString,
      });

      const txHash = await client.writeContract({
        abi: FundsManagerABI.abi,
        address: castedContractAddress,
        functionName: 'setWithdrawalLimit',
        args: [parseEther(newLimit)],
        account: address as HexString,
      });

      console.log('Transaction sent, hash:', txHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Transaction receipt:', receipt);
      alert('Withdrawal limit set successfully!');
      setWithdrawalLimit(parseFloat(newLimit)); // Update the state with the new limit
      setNewLimit(''); // Clear the input field
    } catch (error) {
      console.error("Failed to set withdrawal limit:", error);
      alert(`Failed to set withdrawal limit: ${error.message}`);
    }
  };

  const handleEnableAutoLimit = async () => {
    if (role !== 'superAdmin') return;

    try {
      const client = createWalletClient({
        chain: publicClient.chain,
        transport: custom(window.ethereum),
        account: address as HexString,
      });

      const txHash = await client.writeContract({
        abi: FundsManagerABI.abi,
        address: castedContractAddress,
        functionName: 'enableAutoLimit',
        account: address as HexString,
      });

      console.log('Transaction sent, hash:', txHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Transaction receipt:', receipt);
      alert('Automatic withdrawal limit enabled!');
      setWithdrawalLimit(parseFloat((balance * 70) / 100)); // Update the state with the automatic limit
    } catch (error) {
      console.error("Failed to enable automatic withdrawal limit:", error);
      alert(`Failed to enable automatic withdrawal limit: ${error.message}`);
    }
  };

  const handleWithdrawAll = async () => {
    if (role !== 'superAdmin') return;

    try {
      const client = createWalletClient({
        chain: publicClient.chain,
        transport: custom(window.ethereum),
        account: address as HexString,
      });

      const txHash = await client.writeContract({
        abi: FundsManagerABI.abi,
        address: castedContractAddress,
        functionName: 'withdrawAll',
        account: address as HexString,
      });

      console.log('Transaction sent, hash:', txHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Transaction receipt:', receipt);
      alert('Withdraw all funds successfully!');
    } catch (error) {
      console.error("Failed to withdraw all funds:", error);
      alert(`Failed to withdraw all funds: ${error.message}`);
    }
  };

  const handleWithdrawWithLimit = async () => {
    if (role !== 'withdrawalPerson') return;

    try {
      const client = createWalletClient({
        chain: publicClient.chain,
        transport: custom(window.ethereum),
        account: address as HexString,
      });

      const txHash = await client.writeContract({
        abi: FundsManagerABI.abi,
        address: castedContractAddress,
        functionName: 'withdrawWithLimit',
        account: address as HexString,
      });

      console.log('Transaction sent, hash:', txHash);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      console.log('Transaction receipt:', receipt);
      alert(`Withdraw ${withdrawalLimit} ETH successfully!`);
      setWithdrawalLimit(0); // Reset the withdrawal limit
    } catch (error) {
      console.error("Failed to withdraw with limit:", error);
      alert(`Failed to withdraw with limit: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Treasury Balance</h1>
        <p className="text-lg">Total Balance: {balance} ETH</p>
        <p className="text-lg">Available to Withdraw: {withdrawalLimit} ETH</p>
        {role === 'superAdmin' && (
          <>
            <button
              onClick={handleWithdrawAll}
              className="bg-red-500 text-white p-2 rounded mb-4"
            >
              Withdraw All Funds
            </button>
            <div>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="border p-2 mb-4"
                placeholder="Set new withdrawal limit"
              />
              <button
                onClick={handleSetLimit}
                className="bg-green-500 text-white p-2 rounded mb-4"
              >
                Set Withdrawal Limit
              </button>
              <button
                onClick={handleEnableAutoLimit}
                className="bg-blue-500 text-white p-2 rounded mb-4"
              >
                Enable Automatic Withdrawal Limit
              </button>
            </div>
          </>
        )}
        {role === 'withdrawalPerson' && (
          <div>
            <button
              onClick={handleWithdrawWithLimit}
              className="bg-blue-500 text-white p-2 rounded mb-4"
            >
              Withdraw Limit Amount
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Treasury;
