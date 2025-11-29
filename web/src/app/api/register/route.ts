import { NextResponse } from "next/server";
import { JsonRpcProvider, Wallet } from "ethers";
import { UniPassClient } from "@unipass/sdk";
import { SERVER_CONFIG } from "@/lib/config";

const hasOnChainConfig = Boolean(SERVER_CONFIG.contract && SERVER_CONFIG.rpcUrl && SERVER_CONFIG.relayerKey);

export async function POST(request: Request) {
  const { identityCommitment, passportProof, walletAddress } = await request.json();

  if (!identityCommitment || !passportProof) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }

  if (!hasOnChainConfig) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json({
      simulated: true,
      commitment: identityCommitment,
      walletAddress
    });
  }

  try {
    const provider = new JsonRpcProvider(SERVER_CONFIG.rpcUrl);
    const signer = new Wallet(SERVER_CONFIG.relayerKey!, provider);

    const client = new UniPassClient(
      {
        contractAddress: SERVER_CONFIG.contract!,
        chainId: SERVER_CONFIG.chainId,
        groupId: undefined
      },
      signer
    );

    const tx = await client.register({
      identity: {
        commitment: BigInt(identityCommitment),
        privateKey: "",
        secretScalar: 0n
      },
      proof: {
        proof: passportProof
      }
    });

    const receipt = await tx.wait?.();

    return NextResponse.json({
      txHash: receipt?.hash ?? tx.hash,
      blockNumber: receipt?.blockNumber,
      walletAddress
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "链上注册失败，请稍后再试" }, { status: 500 });
  }
}

