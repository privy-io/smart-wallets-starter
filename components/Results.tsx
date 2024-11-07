import { LinkIcon } from "@heroicons/react/24/outline";
import { MintTestResults } from "./types";

export const Results = ({
  mintTestResults,
}: {
  mintTestResults: MintTestResults[];
}) => {
  return (
    <div className="w-full">
      {mintTestResults.map((results, index) => (
        <div key={index} className="flex w-full gap-2">
          {Object.entries(results).map(([key, value], i) => {
            return (
              <div key={i} className="text-xs w-18">
                <a
                  href={`https://basescan.org/tx/${value.receipt}`}
                  target="_blank"
                  className="flex gap-1 items-center"
                >
                  {key} - {value.time}ms
                  <LinkIcon className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
