import { createSmartAccountClient, SmartAccountClient } from "permissionless";
import {
  toSafeSmartAccount,
  ToSafeSmartAccountReturnType,
} from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { useEffect, useState } from "react";
import { createPublicClient, encodeFunctionData, Hex, http } from "viem";
import {
  createPaymasterClient,
  entryPoint07Address,
  GetUserOperationReceiptReturnType,
  UserOperation,
} from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import { mintAbi } from "./lib/abis/mint";
import { SvgSpinnersBarsRotateFade } from "./iconts/spinner";
import { LinkIcon } from "./iconts/link";

const awaitReceipt = async (
  bundlerClient: SmartAccountClient,
  hash: Hex
): Promise<GetUserOperationReceiptReturnType | undefined> => {
  return new Promise(async (resolve) => {
    let receipt: GetUserOperationReceiptReturnType | undefined = undefined;

    try {
      receipt = await bundlerClient.getUserOperationReceipt({ hash });
      resolve(receipt);
    } catch (err) {
      setTimeout(async () => {
        receipt = await awaitReceipt(bundlerClient, hash);
        resolve(receipt);
      }, 500);
    }
  });
};

const NFT_CONTRACT_ADDRESS =
  "0x3331AfB9805ccF5d6cb1657a8deD0677884604A7" as const;
export function MintManual({
  mintTestTimerStart,
}: {
  mintTestTimerStart: number;
}) {
  const paymaster = createPaymasterClient({
    transport: http(
      `https://api.pimlico.io/v2/8453/rpc?apikey=pim_AgrGPiuPf39qALuR42XMM2`
    ),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(base.rpcUrls.default.http[0]),
  });

  const [account, setAccount] = useState<ToSafeSmartAccountReturnType>();

  const privateKey =
    "0xf012130d64537780b8308d01a887deb2ecb2b4fea8b0cbcf09eabc81735cb395";

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
    transport: http(
      `https://api.pimlico.io/v2/8453/rpc?apikey=pim_AgrGPiuPf39qALuR42XMM2`
    ),
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
      bundlerTransport: http(
        `https://api.pimlico.io/v2/8453/rpc?apikey=pim_AgrGPiuPf39qALuR42XMM2`
      ),
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
      const userOperation = await bundlerClient.prepareUserOperation({
        account: bundlerClient.account,
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

      const signature = await account?.signUserOperation(
        userOperation as UserOperation
      );

      const hash = await bundlerClient.sendUserOperation({
        ...userOperation,
        signature,
      } as UserOperation);

      setReceipt(await awaitReceipt(bundlerClient, hash));
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
          {minting ? <SvgSpinnersBarsRotateFade /> : "manual"}
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
      <div>Smart account address: {bundlerClient?.account?.address}</div>
    </div>
  );
}
