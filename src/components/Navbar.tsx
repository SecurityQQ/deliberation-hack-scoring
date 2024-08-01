// components/Navbar.tsx
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Home, PlusCircle } from 'lucide-react';
import WalletButton from '@/components/WalletButton';
import { ethers } from 'ethers';

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(10); // Default balance

  useEffect(() => {
    if (isConnected && address) {
      // Fetch the balance from the contract or database
      const fetchBalance = async () => {
        // Replace with your contract interaction logic
        // For now, we'll just set a static balance
        setBalance(10); // Set this to the fetched balance
      };

      fetchBalance();
    }
  }, [isConnected, address]);

  return (
    <nav className="bg-muted text-foreground p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-1">
          <Home className="w-5 h-5" />
          <span>Vote</span>
        </Link>
        <Link href="/add-project" className="flex items-center space-x-1">
          <PlusCircle className="w-5 h-5" />
          <span>Add Project</span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <span>Balance: {balance} Tokens</span>
        <WalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
