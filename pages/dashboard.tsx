"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MintManual } from "../components/MintManual";
import { MintPrivy } from "../components/MintPrivy";

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user, logout } = usePrivy();

  const { client: smartWalletClient } = useSmartWallets();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  const [mintTestTimerStart, setMintTestTimerStart] = useState<number>(0);
  const onMintTest = async () => {
    setMintTestTimerStart(mintTestTimerStart + 1);
  };

  return (
    <>
      <Head>
        <title>Privy Smart Wallets Demo</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        {ready && authenticated && smartWalletClient ? (
          <>
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-semibold">
                Privy Smart Wallets Demo
              </h1>
              <button
                onClick={logout}
                className="text-sm bg-violet-200 hover:text-violet-900 py-2 px-4 rounded-md text-violet-700"
              >
                Logout
              </button>
            </div>
            <div className="mt-12 flex gap-4 flex-wrap items-center">
              <MintPrivy mintTestTimerStart={mintTestTimerStart} />
            </div>

            <MintManual mintTestTimerStart={mintTestTimerStart} />
            <div className="mt-12 flex gap-4 flex-wrap items-center">
              <button
                onClick={onMintTest}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none"
              >
                Start Minting Test
              </button>
            </div>

            <p className="mt-6 font-bold uppercase text-sm text-gray-600">
              User object
            </p>
            <pre className="max-w-4xl bg-slate-700 text-slate-50 font-mono p-4 text-xs sm:text-sm rounded-md mt-2">
              {JSON.stringify(user, null, 2)}
            </pre>
          </>
        ) : null}
      </main>
    </>
  );
}
