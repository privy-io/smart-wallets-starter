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

export const Results = ({
  mintTestResults,
  resultNames,
}: {
  mintTestResults: MintTestResults[];
  resultNames: string[];
}) => {
  const dataMap = mintTestResults.map((results) => {
    return Object.entries(results).map(([key, value]) => {
      return {
        name: key,
        receipt: value.receipt,
        time: value.time,
      };
    });
  });

  const data: {
    name: string;
    [key: `mint-${number}`]: number | undefined;
  }[] = [];
  dataMap[0]?.forEach((element, elementIndex) => {
    data.push({
      name: element.name,
      ...mintTestResults
        .map((_, index) => {
          return {
            [`mint-${index + 1}`]:
              dataMap[index]?.[elementIndex]?.time || undefined,
          };
        })
        .reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {}),
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
        {mintTestResults.map((_, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={`mint-${index + 1}`}
            // Generate color based on index, AI suggested formula, not important
            stroke={`#${(index * 433700 + 12345)
              .toString(16)
              .padStart(6, "0")}`}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </div>
  );
};
