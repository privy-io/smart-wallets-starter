"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Head from "next/head";
import { multiChainSign } from "../components/SmartWallets";

export default function DashboardPage() {
  const { ready, authenticated } = usePrivy();
  const { client: smartWalletClient } = useSmartWallets();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(
    (wallet) => wallet.connectorType === "embedded"
  );

  const onClick = async () => {
    if (!embeddedWallet || !smartWalletClient) return;
    const {
      smartAccountAddress,
      smartWalletClient: privySmartWalletClient,
      arbitrumKernelAccount,
      optimismKernelAccount,
    } = await multiChainSign(embeddedWallet, smartWalletClient);
    console.log(smartAccountAddress);
    console.log(privySmartWalletClient.account.address);
    console.log(arbitrumKernelAccount.address);
    console.log(optimismKernelAccount.address);
  };

  return (
    <>
      <Head>
        <title>Privy Smart Wallets Demo</title>
      </Head>

      <main className="flex flex-col items-center justify-center h-screen gap-4">
        <h1>Dashboard</h1>
        {authenticated && ready && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={onClick}
          >
            Test smart wallet
          </button>
        )}
      </main>
    </>
  );
}
