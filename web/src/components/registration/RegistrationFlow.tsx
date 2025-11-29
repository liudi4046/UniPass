"use client";

import { useCallback, useMemo, useState } from "react";
import { deriveIdentity } from "@unipass/sdk";
import { Button } from "../ui/button";
import { clsx } from "clsx";
import { Loader2, ShieldCheck, WalletMinimal } from "lucide-react";

type StepKey = "wallet" | "passport" | "proof";

const STEP_COPY: Record<
  StepKey,
  {
    title: string;
    description: string;
  }
> = {
  wallet: {
    title: "1. 连接钱包",
    description: "用于签名授权，任何兼容钱包皆可。"
  },
  passport: {
    title: "2. 扫描电子护照",
    description: "本地通过 ZKPassport SDK 读取 NFC，并生成匿名身份。"
  },
  proof: {
    title: "3. 生成并提交 ZK 证明",
    description: "UniPass 仅记录承诺值，护照数据不会离开设备。"
  }
};

type RegistrationState = "idle" | "connecting" | "scanning" | "submitting" | "success" | "error";

export function RegistrationFlow() {
  const [state, setState] = useState<RegistrationState>("idle");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [passportProof, setPassportProof] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("等待开始...");
  const [identity, setIdentity] = useState<ReturnType<typeof deriveIdentity> | null>(null);

  const stepStatus = useMemo(() => {
    const result: Record<StepKey, "pending" | "done" | "active"> = {
      wallet: "pending",
      passport: "pending",
      proof: "pending"
    };

    if (walletAddress) {
      result.wallet = "done";
      result.passport = identity ? "done" : "active";
    } else {
      result.wallet = state === "connecting" ? "active" : "pending";
      return result;
    }

    if (identity) {
      result.passport = "done";
      result.proof = passportProof ? "active" : "pending";
    }

    if (state === "success") {
      result.proof = "done";
    }

    return result;
  }, [walletAddress, identity, state, passportProof]);

  const connectWallet = useCallback(async () => {
    setState("connecting");
    setStatusMessage("尝试连接钱包...");

    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
        setWalletAddress(accounts[0]);
        setStatusMessage("钱包连接成功");
      } else {
        setStatusMessage("未检测到钱包，已为你生成临时地址");
        setWalletAddress(`0x${crypto.randomUUID().replace(/-/g, "").slice(0, 40)}`);
      }
    } catch (error) {
      console.error(error);
      setStatusMessage("连接失败，请重试");
      setState("error");
      return;
    }

    setState("idle");
  }, []);

  const scanPassport = useCallback(() => {
    if (!walletAddress) {
      setStatusMessage("请先完成钱包连接");
      return;
    }

    setState("scanning");
    setStatusMessage("本地生成匿名身份中...");

    const generated = deriveIdentity();
    setIdentity(generated);
    setStatusMessage("身份生成完毕，可继续提交 ZK 证明");
    setState("idle");
  }, [walletAddress]);

  const submitProof = useCallback(async () => {
    if (!identity || !passportProof) {
      setStatusMessage("请完成前两步并粘贴 ZK 证明");
      return;
    }

    setState("submitting");
    setStatusMessage("向 UniPass Registry 提交中...");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          passportProof,
          identityCommitment: identity.commitment.toString()
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "注册失败");
      }

      setStatusMessage(payload.simulated ? "本地模拟成功 ✔" : `链上交易成功：${payload.txHash}`);
      setState("success");
    } catch (error) {
      console.error(error);
      setStatusMessage(error instanceof Error ? error.message : "提交失败，请稍后再试");
      setState("error");
    }
  }, [identity, passportProof, walletAddress]);

  return (
    <div className="space-y-8">
      <div className="glass p-6 shadow-card">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-brand" />
          <div>
            <p className="text-sm text-white/70">注册状态</p>
            <p className="text-xl font-semibold text-white">{statusMessage}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {(Object.keys(STEP_COPY) as StepKey[]).map((key) => (
            <div key={key} className="glass p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">{STEP_COPY[key].title}</p>
                  <p className="text-base text-white/90">{STEP_COPY[key].description}</p>
                </div>
                <span
                  className={clsx(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm",
                    stepStatus[key] === "done" && "border-emerald-400 text-emerald-400",
                    stepStatus[key] === "active" && "border-brand text-brand",
                    stepStatus[key] === "pending" && "border-white/20 text-white/40"
                  )}
                >
                  {stepStatus[key] === "done" ? "✔" : key === "wallet" ? 1 : key === "passport" ? 2 : 3}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <WalletMinimal className="h-5 w-5 text-brand" />
              快速操作
            </h3>

            <div className="space-y-3">
              <Button disabled={state === "connecting"} onClick={connectWallet} className="w-full">
                {state === "connecting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {walletAddress ? "重新连接钱包" : "连接钱包"}
              </Button>

              <Button disabled={!walletAddress || state === "scanning"} onClick={scanPassport} variant="secondary" className="w-full">
                {state === "scanning" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                读取护照 / 生成身份
              </Button>
            </div>

            <div>
              <label className="text-sm text-white/70">粘贴 ZKPassport 证明</label>
              <textarea
                className="mt-2 h-32 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 focus:border-brand focus:outline-none"
                placeholder="将 ZKPassport SDK 返回的 proof json 粘贴到此处"
                value={passportProof}
                onChange={(event) => setPassportProof(event.target.value)}
              />
            </div>

            <Button disabled={!identity || !passportProof || state === "submitting"} onClick={submitProof} className="w-full">
              {state === "submitting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              提交并注册
            </Button>
          </div>

          {identity && (
            <div className="glass p-5 text-sm text-white/80 space-y-2">
              <p className="font-semibold text-white">本地匿名身份</p>
              <p className="break-all text-white/70">
                Commitment：
                <span className="text-brand ml-1">{identity.commitment.toString()}</span>
              </p>
              <p className="text-white/60 text-xs">（示例数据仅用于 Demo，真实环境下由手机 NFC 获取并在本地生成）</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

