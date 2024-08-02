import { useEffect, useState } from 'react';
import Layout from "@/components/Layout";
import { useAccount } from 'wagmi';
import { createWalletClient, custom, parseEther, formatEther } from 'viem';
import { publicClient } from "@/lib/publicClient";
import FundsManagerABI from '@/artifacts/contracts/FundsManager.sol/FundsManager.json';
import { Button } from "@/components/ui/button"; // Assuming Button is a default export

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
          }) as Promise<bigint>,
          publicClient.readContract({
            abi: FundsManagerABI.abi,
            address: castedContractAddress,
            functionName: 'getWithdrawalLimit',
          }) as Promise<bigint>,
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
    } catch (error: any) {
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
      setWithdrawalLimit(parseFloat(((balance * 70) / 100).toString())); // Update the state with the automatic limit
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      console.error("Failed to withdraw with limit:", error);
      alert(`Failed to withdraw with limit: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Treasury Balance</h1>
        <p className="text-xl mb-6 text-center">Hackathon Prize Pool: {withdrawalLimit} ETH</p>
        <video 
          src="/m.mp4" 
          className="mx-auto mb-6 w-full max-w-md rounded-lg shadow-md" 
          autoPlay 
          loop 
          muted 
        />
        {role === 'superAdmin' && (
          <>
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Button
                onClick={handleWithdrawAll}
                variant="destructive"
                className="py-2 px-4"
              >
                Withdraw All Funds
              </Button>
              <input
                type="number"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="border p-2 rounded w-64 mb-4 text-center"
                placeholder="Set new withdrawal limit"
              />
              <Button
                onClick={handleSetLimit}
                variant="default"
                className="py-2 px-4"
              >
                Set Withdrawal Limit
              </Button>
              <Button
                onClick={handleEnableAutoLimit}
                variant="default"
                className="py-2 px-4"
              >
                Enable Automatic Withdrawal Limit
              </Button>
            </div>
          </>
        )}
        {role === 'withdrawalPerson' && (
          <div className="flex justify-center">
            <Button
              onClick={handleWithdrawWithLimit}
              variant="outline"
              className="py-2 px-4"
            >
              💸 Withdraw Prize
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Treasury;
