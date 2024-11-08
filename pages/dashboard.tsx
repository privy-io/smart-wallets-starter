"use client";

import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { generatePrivateKey } from "viem/accounts";
import { SvgSpinnersBarsRotateFade } from "../components/iconts/spinner";
import { MintWithTimer } from "../components/MintWithTimer";
import { Results } from "../components/Results";
import { MintTestResults } from "../components/types";
import { getUrlType } from "../components/utils/urlType";

const getMaxKey = (results: MintTestResults) =>
  Math.max(
    ...Object.keys(results)
      .map((key) => Number(key))
      .filter((key) => !isNaN(key))
  );

const testingConfig = [
  {
    privateKey: generatePrivateKey(),
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_1_URL as string,
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_1_URL as string,
  },
  {
    privateKey: generatePrivateKey(),
    bundlerUrl: process.env.NEXT_PUBLIC_BUNDLER_2_URL as string,
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_2_URL as string,
  },
];

export default function DashboardPage() {
  const [mintTestTimerStart, setMintTestTimerStart] = useState<number>(0);
  const onMintTest = async (iterations: number) => {
    setMintEndIndex(mintTestTimerStart + iterations);
    setMintTestTimerStart(mintTestTimerStart + 1);
  };

  // Can't useRef in a callback, so we need to use a ref for each config
  const mintTestResults = [
    useRef<MintTestResults>({}),
    useRef<MintTestResults>({}),
  ];

  // Also can't useState in a callback, so we need a state for each config
  const mintsCompleted = [useState<boolean>(false), useState<boolean>(false)];

  const [mintEndIndex, setMintEndIndex] = useState<number>(0);

  useEffect(() => {
    if (
      mintsCompleted.every((completed) => completed[0]) &&
      mintTestTimerStart < mintEndIndex
    ) {
      mintsCompleted.forEach((completed) => {
        completed[1](false);
      });

      const minKey = Math.min(
        ...mintTestResults.map((mintTestResult) =>
          getMaxKey(mintTestResult.current)
        )
      );
      setMintTestTimerStart(minKey + 1);
    }
  }, [mintsCompleted.map((completed) => completed[0]), mintTestTimerStart]);

  return (
    <>
      <Head>
        <title>Smart Wallets Bundler/Paymaster Comparison</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        <div>
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-semibold">
              Smart Wallets Bundler/Paymaster Comparison
            </h1>
          </div>

          <div className="flex flex-col gap-2">
            {testingConfig.map((config, index) => {
              return (
                <div className="flex gap-4 flex-wrap items-center" key={index}>
                  <MintWithTimer
                    mintTestTimerStart={mintTestTimerStart}
                    mintTestResults={mintTestResults[index]!}
                    setMintCompleted={mintsCompleted[index]![1]!}
                    bundlerUrl={config.bundlerUrl}
                    paymasterUrl={config.paymasterUrl}
                    privateKey={config.privateKey}
                    name={getUrlType(config.bundlerUrl)}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 flex-wrap items-center">
            <button
              onClick={() => onMintTest(10)}
              disabled={mintTestTimerStart < mintEndIndex}
              className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none disabled:bg-violet-400 disabled:cursor-not-allowed flex gap-2 items-center"
            >
              {mintTestTimerStart < mintEndIndex || mintEndIndex === 0
                ? ""
                : "Start "}
              Minting Test
              {mintTestTimerStart < mintEndIndex && (
                <SvgSpinnersBarsRotateFade />
              )}
            </button>
            <button
              onClick={() => setMintEndIndex(mintTestTimerStart)}
              className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none disabled:bg-violet-400 disabled:cursor-not-allowed flex gap-2 items-center"
              disabled={mintTestTimerStart === mintEndIndex}
            >
              Stop
            </button>
            <Results
              mintTestResults={mintTestResults.map((ref) => ref.current)}
              config={testingConfig}
            />
          </div>
        </div>
      </main>
    </>
  );
}
