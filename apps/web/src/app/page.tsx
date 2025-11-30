"use client";

import { useState } from "react";
import { Scan, ShieldCheck, Globe, Key, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Identity } from "@semaphore-protocol/identity";

// Mock contract address
const UNIPASS_CONTRACT_ADDRESS = "0x1234...5678";

export default function Home() {
  const [step, setStep] = useState<"intro" | "scan" | "register" | "dapp">("intro");
  const [scanning, setScanning] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const [passportData, setPassportData] = useState<any>(null);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  // Step 1: Mock Passport Scan
  const handleScanPassport = async () => {
    setScanning(true);
    addLog("Starting NFC Scan...");
    
    // Simulate delay
    await new Promise(r => setTimeout(r, 2000));
    
    addLog("Passport Chip Detected.");
    addLog("Verifying Government Signature (SOD)...");
    
    await new Promise(r => setTimeout(r, 1500));
    
    // Create a deterministic Semaphore identity based on "passport data"
    // In reality, this secret comes from the passport signature
    const mockSecret = "passport-secret-123"; 
    const newIdentity = new Identity(mockSecret);
    
    setPassportData({
      country: "UTOPIA",
      expiry: "2030-01-01",
      commitment: newIdentity.commitment.toString()
    });
    setIdentity(newIdentity);
    setScanning(false);
    setStep("register");
    addLog("Passport Verified. Identity Generated.");
  };

  // Step 2: Register on Chain
  const handleRegister = async () => {
    if (!passportData || !identity) return;
    
    setRegistering(true);
    addLog(`Submitting Commitment to Chain: ${UNIPASS_CONTRACT_ADDRESS}`);
    
    // Simulate Tx
    await new Promise(r => setTimeout(r, 2000));
    
    addLog("Transaction Confirmed.");
    addLog("User added to UniPass Global Anonymity Set.");
    
    setRegistering(false);
    setStep("dapp");
  };

  // Step 3: Verify in DApp
  const handleDAppVerify = async () => {
    if (!identity) return;
    
    setVerifying(true);
    addLog("DApp 'Uniswap' requesting verification...");
    addLog("Generating Zero-Knowledge Proof (Membership + Nullifier)...");
    
    // In a real app, we would use:
    // const proof = await generateProof(identity, group, externalNullifier, signal);
    
    await new Promise(r => setTimeout(r, 3000));
    
    addLog("Proof Generated.");
    addLog("Verifying Proof on-chain...");
    
    await new Promise(r => setTimeout(r, 1000));
    
    addLog("SUCCESS: User is a unique human. Airdrop Claimed!");
    setVerifying(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 font-sans selection:bg-green-900">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-green-900/20 rounded-full mb-4">
            <Globe className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            UniPass
          </h1>
          <p className="text-gray-400 text-xl max-w-lg mx-auto">
            Global Anonymous Identity Layer based on Electronic Passports.
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          
          {/* Step Indicator */}
          <div className="flex justify-between mb-12 border-b border-zinc-800 pb-4">
            {["intro", "scan", "register", "dapp"].map((s, i) => (
              <div key={s} className={`flex items-center space-x-2 ${step === s ? "text-green-500" : "text-zinc-600"}`}>
                <div className={`w-3 h-3 rounded-full ${step === s ? "bg-green-500" : "bg-zinc-800"}`} />
                <span className="capitalize hidden sm:block">{s}</span>
              </div>
            ))}
          </div>

          <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
            
            {step === "intro" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">One Passport, Infinite Identities.</h2>
                  <p className="text-zinc-400">Prove you are human without revealing who you are.</p>
                </div>
                <button 
                  onClick={() => setStep("scan")}
                  className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition flex items-center mx-auto space-x-2"
                >
                  <span>Start Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === "scan" && (
              <div className="space-y-6 animate-in fade-in">
                <div className="relative">
                  <Scan className={`w-20 h-20 text-green-500 ${scanning ? "animate-pulse" : ""}`} />
                  {scanning && <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Scan Your Passport</h2>
                  <p className="text-zinc-400">Place your phone on the back cover of your e-Passport.</p>
                </div>
                <button 
                  onClick={handleScanPassport}
                  disabled={scanning}
                  className="bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scanning ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying NFC Chip...</span>
                    </span>
                  ) : (
                    "Scan NFC"
                  )}
                </button>
              </div>
            )}

            {step === "register" && passportData && (
              <div className="space-y-6 animate-in fade-in w-full max-w-md">
                <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 text-left space-y-4">
                  <div className="flex items-center space-x-3 text-green-400">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="font-bold">Passport Validated</span>
                  </div>
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex justify-between">
                      <span>Issuer:</span>
                      <span className="text-white">{passportData.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ZK Identity:</span>
                      <span className="text-white font-mono">{passportData.commitment.slice(0, 10)}...</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {registering ? (
                     <span className="flex items-center justify-center space-x-2">
                     <Loader2 className="w-4 h-4 animate-spin" />
                     <span>Minting ZK Identity...</span>
                   </span>
                  ) : "Register on Chain"}
                </button>
              </div>
            )}

            {step === "dapp" && (
              <div className="space-y-6 animate-in fade-in w-full max-w-md">
                 <div className="p-6 rounded-xl border border-zinc-800 bg-gradient-to-br from-purple-900/20 to-blue-900/20 text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Uniswap Airdrop</h3>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Demo DApp</span>
                  </div>
                  <p className="text-zinc-400 text-sm">Claim your UNI tokens anonymously. Sybil-resistant.</p>
                </div>
                <button 
                  onClick={handleDAppVerify}
                  disabled={verifying}
                  className="w-full bg-purple-600 text-white px-8 py-3 rounded-full font-bold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {verifying ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Proof...</span>
                    </span>
                  ) : (
                    "Prove Personhood & Claim"
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Console Logs */}
        <div className="bg-black/50 border border-zinc-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs text-zinc-500 space-y-1">
          {logs.length === 0 && <span className="text-zinc-700">// System logs will appear here...</span>}
          {logs.map((log, i) => (
            <div key={i} className="border-l-2 border-green-900 pl-2">{log}</div>
          ))}
        </div>

      </div>
    </div>
  );
}

