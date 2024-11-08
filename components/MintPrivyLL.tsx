import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useEffect, useState } from "react";
import { encodeFunctionData } from "viem";
import { mintAbi } from "../components/lib/abis/mint";
import { LinkIcon } from "./iconts/link";
import { SvgSpinnersBarsRotateFade } from "./iconts/spinner";
import { NFT_CONTRACT_ADDRESS } from "./lib/constants";
import { MintTesterProps } from "./types";

/**
 * This mint uses Privy's smart wallets but with underlying calls from smartWalletClient.sendTransaction
 */

export const MintPrivyLL = ({
  mintTestTimerStart,
  mintTestResults,
  setMintCompleted,
}: MintTesterProps) => {
  const { client: smartWalletClient } = useSmartWallets();
  const [mintingTime, setMintingTime] = useState<number>(0);
  const [minting, setMinting] = useState<boolean>(false);
  const [mintReceipt, setMintReceipt] = useState<string>("");
  const onMint = async () => {
    if (!smartWalletClient) return;

    setMinting(true);
    const startTime = Date.now();

    // Prepare the user operation
    const hash = await smartWalletClient.sendUserOperation({
      calls: [
        {
          to: NFT_CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: mintAbi,
            functionName: "mint",
            args: [smartWalletClient.account.address],
          }),
        },
      ],
    });

    // Wait for the receipt, but with polling interval set to 500ms and higher corresponding retry count
    const receipt = await smartWalletClient.waitForUserOperationReceipt({
      hash,
      pollingInterval: 500,
      retryCount: 12,
    });

    const endTime = Date.now();
    setMinting(false);
    setMintingTime(endTime - startTime);
    setMintReceipt(receipt.receipt.transactionHash);
    mintTestResults.current = {
      ...mintTestResults.current,
      [mintTestTimerStart]: {
        time: endTime - startTime,
        receipt: hash,
      },
    };
    setMintCompleted(true);
  };

  useEffect(() => {
    if (mintTestTimerStart > 0) {
      onMint();
    }
  }, [mintTestTimerStart]);
  return (
    <div className="flex flex-row gap-2 items-center">
      <button
        onClick={onMint}
        className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none flex gap-2 items-center"
      >
        Mint{minting ? "ing" : ""}{" "}
        {minting ? <SvgSpinnersBarsRotateFade /> : "with Privy LL"}
      </button>
      {mintReceipt ? (
        <a
          href={`https://basescan.org/tx/${mintReceipt}`}
          className="flex gap-1 items-center"
          target="_blank"
        >
          <p className="text-sm text-gray-600">{mintingTime}ms</p>
          <LinkIcon />
        </a>
      ) : (
        <p className="text-sm text-gray-600">{mintingTime}ms</p>
      )}
    </div>
  );
};
