import { createPublicClient, http } from "viem";
import { arbitrum, optimism } from "viem/chains";

const chains = [arbitrum, optimism];
export const createViemPublicClient = (chainId: number) => {
  const chain = chains.find((c) => c.id === chainId);
  return createPublicClient({
    chain: arbitrum,
    transport: http(),
  });
};
