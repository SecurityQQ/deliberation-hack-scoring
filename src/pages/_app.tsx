import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Web3Provider } from '../components/Web3Provider';
import Navbar from '@/components/Navbar';


export default function App({ Component, pageProps }: AppProps) {
  return (
  <Web3Provider>
        <Component {...pageProps} />;
    </Web3Provider>
   );
}

