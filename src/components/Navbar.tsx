import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { Home, PlusCircle, DollarSign, Banknote, Menu } from 'lucide-react';
import WalletButton from '@/components/WalletButton';

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState(10);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      const fetchBalance = async () => {
        try {
          const response = await axios.get(`/api/get-balance?wallet=${address}`);
          setBalance(Math.floor(response.data.balance));
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };

      fetchBalance();
    }
  }, [isConnected, address]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-primary text-primary-foreground p-4 flex flex-col md:flex-row items-center justify-between w-full relative mb-8">
      <div className="flex items-center justify-between w-full md:w-auto">
        <button onClick={toggleMenu} className="md:hidden">
          <Menu className="w-6 h-6 text-accent" />
        </button>
        <Link href="/" className="flex items-center space-x-1 ml-2 md:ml-0 md:hidden">
          <Home className="w-5 h-5 text-accent" />
        </Link>
      </div>

      <div className="hidden md:flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-1 ml-2 md:ml-0 hover:text-accent transition-all duration-300">
            <Home className="w-5 h-5 text-accent" />
            <span className="hidden md:inline font-extrabold text-primary-foreground">Vote</span>
          </Link>
          <Link href="/add-project" className="flex items-center space-x-1 hover:text-accent transition-all duration-300">
            <PlusCircle className="w-5 h-5 text-accent" />
            <span className="hidden md:inline font-extrabold text-primary-foreground">Add Project</span>
          </Link>
          <Link href="/add-balance" className="flex items-center space-x-1 hover:text-accent transition-all duration-300">
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="hidden md:inline font-extrabold text-primary-foreground">Add Balance</span>
          </Link>
          <Link href="/treasury" className="flex items-center space-x-1 hover:text-accent transition-all duration-300">
            <Banknote className="w-5 h-5 text-accent" />
            <span className="hidden md:inline font-extrabold text-primary-foreground">Treasury</span>
          </Link>
          {/*<Link href="/leaderboard" className="flex items-center space-x-1 hover:text-accent transition-all duration-300">
            <span className="hidden md:inline font-extrabold text-primary-foreground">Leaderboard</span>
          </Link>*/}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 p-2 bg-secondary rounded-full shadow-md">
            <Image src="/coin.gif" alt="Coin" width={24} height={24} />
            <span className="text-accent-foreground font-semibold">{balance}</span>
          </div>
          <WalletButton />
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-primary text-primary-foreground flex flex-col items-start p-4 md:hidden">
          <Link href="/add-project" className="flex items-center space-x-1 mb-2" onClick={toggleMenu}>
            <PlusCircle className="w-5 h-5 text-accent" />
            <span className="font-extrabold text-primary-foreground">Add Project</span>
          </Link>
          <Link href="/add-balance" className="flex items-center space-x-1 mb-2" onClick={toggleMenu}>
            <DollarSign className="w-5 h-5 text-accent" />
            <span className="font-extrabold text-primary-foreground">Add Balance</span>
          </Link>
          <Link href="/treasury" className="flex items-center space-x-1" onClick={toggleMenu}>
            <Banknote className="w-5 h-5 text-accent" />
            <span className="font-extrabold text-primary-foreground">Treasury</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center space-x-1" onClick={toggleMenu}>
            <span className="font-extrabold text-primary-foreground">Leaderboard</span>
          </Link>
          <div className="flex items-center space-x-2 p-2 bg-secondary rounded-full shadow-md mt-2">
            <Image src="/coin.gif" alt="Coin" width={24} height={24} />
            <span className="text-accent-foreground font-semibold">{balance}</span>
          </div>
          <div className="mt-2">
            <WalletButton />
          </div>
        </div>
      )}

      {router.pathname !== '/leaderboard' && (
        
        <div className="absolute left-1/2 transform -translate-x-1/2 -mt-4 md:mt-16 hover:scale-110 transition-transform duration-300">
        <Link href="/leaderboard">
          <div className="relative w-24 h-24 rounded-full bg-white bg-opacity-10 shadow-lg backdrop-filter backdrop-blur-md border border-background">
            <Image src="/200w.gif" alt="Animated GIF" layout="fill" className="object-cover rounded-full" />
          </div>
          <h1 className="text-xl font-bold text-accent mt-2 hidden md:block text-center -ml-2">Leaderboard</h1>
          </Link>
        </div>
        
      )}
    </nav>
  );
};

export default Navbar;
