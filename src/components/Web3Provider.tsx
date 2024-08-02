// components/Web3Provider.tsx

import React, { ReactNode } from "react";
import { WagmiConfig, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains"; // Import Sepolia chain
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

if (!alchemyId) {
  console.error("NEXT_PUBLIC_ALCHEMY_ID is not set");
}

if (!walletConnectProjectId) {
  console.error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set");
}

const config = createConfig(
  getDefaultConfig({
    // Your dApp's chains
    chains: [sepolia], // Use Sepolia testnet
    transports: {
      // RPC URL for Sepolia testnet
      [sepolia.id]: http(
        `https://eth-sepolia.g.alchemy.com/v2/${alchemyId}`
      ),
    },

    // Required API Keys
    walletConnectProjectId: walletConnectProjectId,

    // Required App Info
    appName: "deliberatescoring",

    // Optional App Info
    appDescription: "A hackathon project showcase app",
    appUrl: "https://my-hackathon-app.com", // your app's URL
    appIcon: "https://my-hackathon-app.com/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
};
