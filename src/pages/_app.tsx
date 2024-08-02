import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Web3Provider } from '@/components/Web3Provider';
import { Toaster } from "@/components/ui/toaster"


export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
        <Component {...pageProps} />;
        <Toaster />
    </Web3Provider>
   );
}

