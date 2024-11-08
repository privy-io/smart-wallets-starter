"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { MintManual } from "../components/MintManual";
import { MintPrivy } from "../components/MintPrivy";
import { MintTestResults } from "../components/types";
import { SvgSpinnersBarsRotateFade } from "../components/iconts/spinner";
import { Results } from "../components/Results";
import { MintPrivyLL } from "../components/MintPrivyLL";

const getMaxKey = (results: MintTestResults) =>
  Math.max(
    ...Object.keys(results)
      .map((key) => Number(key))
      .filter((key) => !isNaN(key))
  );

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
  const onMintTest = async (iterations: number) => {
    setMintEndIndex(mintTestTimerStart + iterations);
    setMintTestTimerStart(mintTestTimerStart + 1);
  };

  const mintPrivyTestResults = useRef<MintTestResults>({});
  const mintPrivyLLTestResults = useRef<MintTestResults>({});
  const mintManualTestResults = useRef<MintTestResults>({});

  const [mintPrivyCompleted, setMintPrivyCompleted] = useState<boolean>(false);
  const [mintPrivyLLCompleted, setMintPrivyLLCompleted] =
    useState<boolean>(false);
  const [mintManualCompleted, setMintManualCompleted] =
    useState<boolean>(false);

  const [mintEndIndex, setMintEndIndex] = useState<number>(0);

  useEffect(() => {
    if (
      mintPrivyCompleted &&
      mintManualCompleted &&
      mintTestTimerStart < mintEndIndex
    ) {
      setMintPrivyCompleted(false);
      setMintManualCompleted(false);

      const minKey = Math.min(
        getMaxKey(mintPrivyTestResults.current),
        getMaxKey(mintPrivyLLTestResults.current),
        getMaxKey(mintManualTestResults.current)
      );
      setMintTestTimerStart(minKey + 1);
    }
  }, [
    mintPrivyCompleted,
    mintPrivyLLCompleted,
    mintManualCompleted,
    mintTestTimerStart,
  ]);

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
              <MintPrivy
                mintTestTimerStart={mintTestTimerStart}
                mintTestResults={mintPrivyTestResults}
                setMintCompleted={setMintPrivyCompleted}
              />
            </div>
            <div className="mt-4 flex gap-4 flex-wrap items-center">
              <MintPrivyLL
                mintTestTimerStart={mintTestTimerStart}
                mintTestResults={mintPrivyLLTestResults}
                setMintCompleted={setMintPrivyLLCompleted}
              />
            </div>
            <MintManual
              mintTestTimerStart={mintTestTimerStart}
              mintTestResults={mintManualTestResults}
              setMintCompleted={setMintManualCompleted}
            />
            <div className="mt-4 flex gap-4 flex-wrap items-center">
              <button
                onClick={() => onMintTest(10)}
                disabled={mintTestTimerStart < mintEndIndex}
                className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none disabled:bg-violet-500 disabled:cursor-not-allowed flex gap-2 items-center"
              >
                {mintTestTimerStart < mintEndIndex || mintEndIndex === 0
                  ? ""
                  : "Start "}
                Minting Test
                {mintTestTimerStart < mintEndIndex && (
                  <SvgSpinnersBarsRotateFade />
                )}
              </button>
              <Results
                mintTestResults={[
                  mintPrivyTestResults.current,
                  mintPrivyLLTestResults.current,
                  mintManualTestResults.current,
                ]}
                resultNames={["privy", "privy-ll", "manual"]}
              />
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
