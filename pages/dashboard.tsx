"use client";

import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { Hex } from "viem";
import { SvgSpinnersBarsRotateFade } from "../components/iconts/spinner";
import { MintWithTimer } from "../components/MintWithTimer";
import { Results } from "../components/Results";
import { MintTestResults } from "../components/types";

const getMaxKey = (results: MintTestResults) =>
  Math.max(
    ...Object.keys(results)
      .map((key) => Number(key))
      .filter((key) => !isNaN(key))
  );

export default function DashboardPage() {
  const [mintTestTimerStart, setMintTestTimerStart] = useState<number>(0);
  const onMintTest = async (iterations: number) => {
    setMintEndIndex(mintTestTimerStart + iterations);
    setMintTestTimerStart(mintTestTimerStart + 1);
  };

  const mintTestReults1 = useRef<MintTestResults>({});
  const mintTestReults2 = useRef<MintTestResults>({});

  const [mint1Completed, setMint1Completed] = useState<boolean>(false);
  const [mint2Completed, setMint2Completed] = useState<boolean>(false);

  const [mintEndIndex, setMintEndIndex] = useState<number>(0);

  useEffect(() => {
    if (mint1Completed && mint2Completed && mintTestTimerStart < mintEndIndex) {
      console.log("mint1Completed", mint1Completed);
      console.log("mint2Completed", mint2Completed);
      setMint1Completed(false);
      setMint2Completed(false);

      const minKey = Math.min(
        getMaxKey(mintTestReults1.current),
        getMaxKey(mintTestReults2.current)
      );
      setMintTestTimerStart(minKey + 1);
    }
  }, [mint1Completed, mint2Completed, mintTestTimerStart]);

  return (
    <>
      <Head>
        <title>Smart Wallets Bundler/Paymster Comparison</title>
      </Head>

      <main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
        <div>
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-semibold">
              Smart Wallets Bundler/Paymster Comparison
            </h1>
          </div>
          <div className="mt-12 flex gap-4 flex-wrap items-center">
            <MintWithTimer
              mintTestTimerStart={mintTestTimerStart}
              mintTestResults={mintTestReults1}
              setMintCompleted={setMint1Completed}
              bundlerUrl={process.env.NEXT_PUBLIC_BUNDLER_1_URL as string}
              paymasterUrl={process.env.NEXT_PUBLIC_PAYMASTER_1_URL as string}
              privateKey={process.env.NEXT_PUBLIC_PRIVATE_KEY_1 as Hex}
            />
          </div>
          <div className="mt-2 flex gap-4 flex-wrap items-center">
            <MintWithTimer
              mintTestTimerStart={mintTestTimerStart}
              mintTestResults={mintTestReults2}
              setMintCompleted={setMint2Completed}
              bundlerUrl={process.env.NEXT_PUBLIC_BUNDLER_2_URL as string}
              paymasterUrl={process.env.NEXT_PUBLIC_PAYMASTER_2_URL as string}
              privateKey={process.env.NEXT_PUBLIC_PRIVATE_KEY_2 as Hex}
            />
          </div>
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
                mintTestReults1.current,
                mintTestReults2.current,
              ]}
              resultNames={["mint-1", "mint-2"]}
            />
          </div>
        </div>
      </main>
    </>
  );
}
