// components/Navbar.tsx
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Home, PlusCircle } from 'lucide-react';
import WalletButton from '@/components/WalletButton';


const Navbar = () => {
  const { isConnected } = useAccount();

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
      <div>
          <WalletButton />
      </div>
    </nav>
  );
};

export default Navbar;
