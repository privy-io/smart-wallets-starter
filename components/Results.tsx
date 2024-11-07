import { LinkIcon } from "@heroicons/react/24/outline";
import { MintTestResults } from "./types";
import {
  CartesianGrid,
  Tooltip,
  YAxis,
  Line,
  LineChart,
  XAxis,
  Legend,
} from "recharts";
import { Hash } from "viem";

export const Results = ({
  mintTestResults,
  resultNames,
}: {
  mintTestResults: MintTestResults[];
  resultNames: string[];
}) => {
  // transform data into:
  // {
  //   name: "Mint {index}",
  //   privy: 4000,
  //   manual: 2400,
  // }[],
  const dataMap = mintTestResults.map((results) => {
    return Object.entries(results).map(([key, value]) => {
      return {
        name: key,
        receipt: value.receipt,
        time: value.time,
      };
    });
  });

  const data: { name: string; privy: number; manual: number }[] = [];
  dataMap[0]?.forEach((element, index) => {
    data.push({
      name: element.name,
      [resultNames[0] as "privy"]: element.time,
      [resultNames[1] as "manual"]: dataMap[1]?.[index]?.time || 0,
    });
  });

  return (
    <div className="w-full">
      <div className="w-full overflow-x-scroll max-w-6xl">
        {mintTestResults.map((results, index) => (
          <div key={index} className="flex w-full gap-2">
            <p className="text-xs w-24 flex-shrink-0">{resultNames[index]}</p>
            {Object.entries(results).map(([key, value], i) => {
              return (
                <div
                  key={i}
                  className="text-xs w-24 flex-shrink-0 whitespace-nowrap"
                >
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
      <LineChart width={1000} height={300} data={data} margin={{ top: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          label={{ value: "Time (ms)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="privy"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="manual" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
};
