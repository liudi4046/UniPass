"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { Wallet, LogOut, ChevronDown, AlertCircle } from "lucide-react";
import { useState } from "react";
import { sepolia } from "wagmi/chains";

export function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showDropdown, setShowDropdown] = useState(false);

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  if (isConnected && address) {
    return (
      <div className="relative">
        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="mr-2 px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg text-sm flex items-center space-x-1 hover:bg-yellow-600/30 transition"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Switch to Sepolia</span>
          </button>
        )}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50">
            <button
              onClick={() => {
                disconnect();
                setShowDropdown(false);
              }}
              className="w-full px-4 py-3 text-left text-red-400 hover:bg-zinc-800 rounded-lg flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center space-x-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-5 h-5" />
          <span>{isPending ? "Connecting..." : `Connect ${connector.name}`}</span>
        </button>
      ))}
    </div>
  );
}

// Minimal connect button for header
export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="flex items-center space-x-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-full transition border border-zinc-700"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="font-mono text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </button>
    );
  }

  const injectedConnector = connectors.find((c) => c.id === "injected");

  return (
    <button
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={isPending}
      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-full transition disabled:opacity-50"
    >
      <Wallet className="w-4 h-4" />
      <span>{isPending ? "..." : "Connect"}</span>
    </button>
  );
}

