import { MutableRefObject } from "react";

export type MintTestResults = {
  [key: number]: {
    time: number;
    receipt: string;
  };
};

export type MintTesterProps = {
  mintTestTimerStart: number;
  mintTestResults: MutableRefObject<MintTestResults>;
  setMintCompleted: (completed: boolean) => void;
};
