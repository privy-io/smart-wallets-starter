import { MutableRefObject } from "react";
import { Hex } from "viem";

export type MintTestResults = {
  [key: number]: {
    time: number;
    receipt: string;
  };
};

export type MintTesterProps = {
  privateKey: Hex;
  mintTestTimerStart: number;
  mintTestResults: MutableRefObject<MintTestResults>;
  setMintCompleted: (completed: boolean) => void;
  bundlerUrl: string;
  paymasterUrl: string;
  name: string;
};

export type BundlerTypes = "zerodev" | "pimlico" | "unknown";
