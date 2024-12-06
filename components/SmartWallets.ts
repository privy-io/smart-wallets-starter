import { getKernelAddressFromECDSA } from "@zerodev/ecdsa-validator";
import { toMultiChainECDSAValidator } from "@zerodev/multi-chain-ecdsa-validator";
import { createKernelAccount } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Signer } from "@zerodev/sdk/types";
import { arbitrum, optimism } from "viem/chains";

import { ConnectedWallet } from "@privy-io/react-auth";

import { createViemPublicClient } from "./createViemPublicClient";

// const OPTIMISM_ZERODEV_BUNDLER_RPC_URL = "https://optimism-bundler.zerodev.app";
// const ARBITRUM_ZERODEV_BUNDLER_RPC_URL = "https://arbitrum-bundler.zerodev.app";
// const OPTIMISM_ZERODEV_PAYMASTER_RPC_URL =
//   "https://optimism-paymaster.zerodev.app";
// const ARBITRUM_ZERODEV_PAYMASTER_RPC_URL =
//   "https://arbitrum-paymaster.zerodev.app";

// const dummySignature =
// "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c" as const;

const entryPoint = getEntryPoint("0.7");

export const multiChainSign = async (
  embeddedWallet: ConnectedWallet | undefined,
  smartWalletClient: any
): Promise<{
  smartAccountAddress: `0x${string}`;
  smartWalletClient: any;
  arbitrumKernelAccount: any;
  optimismKernelAccount: any;
}> => {
  if (!embeddedWallet) {
    throw new Error("No embedded wallet");
  }
  if (!smartWalletClient) {
    throw new Error("No smart wallet client");
  }

  const arbitrumPublicClient = createViemPublicClient(42161);
  const optimismPublicClient = createViemPublicClient(10);

  const provider = await embeddedWallet.getEthereumProvider();

  const smartAccountAddress = await getKernelAddressFromECDSA({
    entryPoint,
    kernelVersion: KERNEL_V3_1,
    publicClient: arbitrumPublicClient,
    eoaAddress: embeddedWallet.address as `0x${string}`,
    index: BigInt(0),
  });

  const arbitrumMultiSigECDSAValidatorPlugin = await toMultiChainECDSAValidator(
    arbitrumPublicClient,
    {
      entryPoint,
      signer: provider as Signer,
      kernelVersion: KERNEL_V3_1,
      multiChainIds: [arbitrum.id, optimism.id],
      validatorAddress: "0x845ADb2C711129d4f3966735eD98a9F09fC4cE57",
    }
  );

  console.log(arbitrumMultiSigECDSAValidatorPlugin);

  const optimismMultiSigECDSAValidatorPlugin = await toMultiChainECDSAValidator(
    optimismPublicClient,
    {
      entryPoint,
      signer: provider as Signer,
      kernelVersion: KERNEL_V3_1,
      multiChainIds: [arbitrum.id, optimism.id],
      validatorAddress: "0x845ADb2C711129d4f3966735eD98a9F09fC4cE57",
    }
  );

  const arbitrumKernelAccount = await createKernelAccount(
    arbitrumPublicClient,
    {
      entryPoint,
      plugins: {
        sudo: arbitrumMultiSigECDSAValidatorPlugin,
      },
      kernelVersion: KERNEL_V3_1,
    }
  );

  const optimismKernelAccount = await createKernelAccount(
    optimismPublicClient,
    {
      entryPoint,
      plugins: {
        sudo: optimismMultiSigECDSAValidatorPlugin,
      },
      kernelVersion: KERNEL_V3_1,
    }
  );

  return {
    smartAccountAddress,
    smartWalletClient,
    arbitrumKernelAccount,
    optimismKernelAccount,
  };

  // console.log("getKernelAddressFromECDSA", smartAccountAddress);
  // console.log("privy smart account address", smartWalletClient.account.address);
  // console.log("arbitrumKernelAccount.address", arbitrumKernelAccount.address);
  // console.log("optimismKernelAccount.address", optimismKernelAccount.address);

  // const arbitrumZeroDevPaymasterClient = createZeroDevPaymasterClient({
  //   chain: arbitrum,
  //   transport: http(ARBITRUM_ZERODEV_PAYMASTER_RPC_URL),
  // });

  // const optimismZeroDevPaymasterClient = createZeroDevPaymasterClient({
  //   chain: optimism,
  //   transport: http(OPTIMISM_ZERODEV_PAYMASTER_RPC_URL),
  // });

  // const arbitrumZerodevKernelClient = createKernelAccountClient<
  //   Transport,
  //   Chain,
  //   SmartAccount
  // >({
  //   account: arbitrumKernelAccount,
  //   chain: arbitrum,
  //   bundlerTransport: http(ARBITRUM_ZERODEV_BUNDLER_RPC_URL),
  //   paymaster: {
  //     getPaymasterData(userOperation) {
  //       return arbitrumZeroDevPaymasterClient.sponsorUserOperation({
  //         userOperation,
  //       });
  //     },
  //   },
  // });

  // const optimismZerodevKernelClient = createKernelAccountClient<
  //   Transport,
  //   Chain,
  //   SmartAccount
  // >({
  //   account: optimismKernelAccount,
  //   chain: optimism,
  //   bundlerTransport: http(OPTIMISM_ZERODEV_BUNDLER_RPC_URL),
  //   paymaster: {
  //     getPaymasterData(userOperation) {
  //       return optimismZeroDevPaymasterClient.sponsorUserOperation({
  //         userOperation,
  //       });
  //     },
  //   },
  // });

  // const clients: Client<Transport, Chain, SmartAccount>[] = [
  //   { ...arbitrumZerodevKernelClient },
  //   { ...optimismZerodevKernelClient },
  // ];

  // const userOps = await Promise.all(
  //   clients.map(async (client) => {
  //     return {
  //       callData: await client.account.encodeCalls([
  //         {
  //           to: zeroAddress,
  //           value: BigInt(0),
  //           data: "0x",
  //         },
  //       ]),
  //     };
  //   })
  // );

  // const userOpParams = [
  //   {
  //     ...userOps[0],
  //     chainId: arbitrum.id,
  //     signature: dummySignature,
  //   },
  //   {
  //     ...userOps[1],
  //     chainId: optimism.id,
  //     signature: dummySignature,
  //   },
  // ];

  // const signedUserOps = await prepareAndSignUserOperations(
  //   clients,
  //   userOpParams
  // );

  // const arbitrumUserOp = signedUserOps[0];
  // const optimismUserOp = signedUserOps[1];

  // console.log("sending arbitrumUserOp");
  // const arbitrumUserOpHash =
  //   await arbitrumZerodevKernelClient.sendUserOperation(arbitrumUserOp);

  // console.log("arbitrumUserOpHash", arbitrumUserOpHash);
  // const arbitrumReceipt =
  //   await arbitrumZerodevKernelClient.waitForUserOperationReceipt({
  //     hash: arbitrumUserOpHash,
  //   });

  // console.log("arbitrumReceipt", arbitrumReceipt);

  // console.log("sending optimismUserOp");
  // const optimismUserOpHash =
  //   await optimismZerodevKernelClient.sendUserOperation(optimismUserOp);

  // console.log("optimismUserOpHash", optimismUserOpHash);
  // const optimismReceipt =
  //   await optimismZerodevKernelClient.waitForUserOperationReceipt({
  //     hash: optimismUserOpHash,
  //   });

  // console.log("optimismReceipt", optimismReceipt);
};
