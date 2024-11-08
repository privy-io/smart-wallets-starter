/**
 * This is using permissionless directly with a private key account EOA
 */

import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import {
  toSafeSmartAccount,
  ToSafeSmartAccountReturnType,
} from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { useEffect, useState } from "react";
import { createPublicClient, encodeFunctionData, http } from "viem";
import {
  createPaymasterClient,
  entryPoint07Address,
  GetUserOperationReceiptReturnType,
} from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { LinkIcon } from "./iconts/link";
import { SvgSpinnersBarsRotateFade } from "./iconts/spinner";
import { mintAbi } from "./lib/abis/mint";
import { NFT_CONTRACT_ADDRESS } from "./lib/constants";
import { MintTesterProps } from "./types";

export function MintWithTimer({
  mintTestTimerStart,
  mintTestResults,
  setMintCompleted,
  bundlerUrl,
  paymasterUrl,
  privateKey,
}: MintTesterProps) {
  const paymaster = createPaymasterClient({
    transport: http(paymasterUrl),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(base.rpcUrls.default.http[0]),
  });

  const [account, setAccount] = useState<ToSafeSmartAccountReturnType>();

  useEffect(() => {
    const getAccount = async () =>
      toSafeSmartAccount({
        client: publicClient,
        owners: [privateKeyToAccount(privateKey)],
        entryPoint: {
          address: entryPoint07Address,
          version: "0.7",
        }, // global entrypoint
        version: "1.4.1",
        saltNonce: 0n,
      });

    getAccount().then((account) => {
      setAccount(account);
    });
  }, []);

  const [bundlerClient, setBundlerClient] = useState<SmartAccountClient>();

  const pimlicoClient = createPimlicoClient({
    transport: http(bundlerUrl),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  useEffect(() => {
    if (!account) return;
    if (bundlerClient) return;

    const createdBundlerClient = createSmartAccountClient({
      account,
      paymaster,
      chain: base,
      bundlerTransport: http(bundlerUrl),
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });

    setBundlerClient(createdBundlerClient);
  }, [account]);

  const [minting, setMinting] = useState<boolean>(false);
  const [mintingTime, setMintingTime] = useState<number>(0);
  const [receipt, setReceipt] = useState<GetUserOperationReceiptReturnType>();

  useEffect(() => {
    if (mintTestTimerStart > 0) {
      onMint();
    }
  }, [mintTestTimerStart]);

  const onMint = async () => {
    if (!bundlerClient || !bundlerClient.account) return;

    setMinting(true);
    const startTime = Date.now();
    try {
      const hash = await bundlerClient.sendUserOperation({
        calls: [
          {
            to: NFT_CONTRACT_ADDRESS,
            data: encodeFunctionData({
              abi: mintAbi,
              functionName: "mint",
              args: [bundlerClient.account.address],
            }),
          },
        ],
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash,
        pollingInterval: 500,
        retryCount: 12,
      });

      setReceipt(receipt);
      if (receipt) {
        mintTestResults.current = {
          ...mintTestResults.current,
          [mintTestTimerStart]: {
            time: Date.now() - startTime,
            receipt: receipt.receipt.transactionHash,
          },
        };
        setMintCompleted(true);
      }
    } catch (error) {
      console.error(error);
    }
    setMinting(false);
    setMintingTime(Date.now() - startTime);
  };

  return (
    <div>
      <div className="mt-4 flex gap-4 flex-wrap items-center">
        <button
          onClick={onMint}
          className="text-sm bg-violet-600 hover:bg-violet-700 py-2 px-4 rounded-md text-white border-none flex gap-2 items-center"
        >
          Mint{minting ? "ing" : ""}{" "}
          {minting ? <SvgSpinnersBarsRotateFade /> : "w/Pimlico"}
        </button>

        {receipt ? (
          <div>
            <a
              href={`https://basescan.org/tx/${receipt.receipt.transactionHash}`}
              target="_blank"
              className="flex gap-1 items-center"
            >
              <div className="text-sm text-gray-600">{mintingTime}ms </div>
              <LinkIcon />
            </a>
          </div>
        ) : (
          <div className="text-sm text-gray-600">{mintingTime}ms</div>
        )}
      </div>
      <div className="text-xs text-gray-600">Bundler: {bundlerUrl}</div>
      <div className="text-xs text-gray-600">Paymaster: {paymasterUrl}</div>
    </div>
  );
}
