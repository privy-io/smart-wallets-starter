import { LinkIcon } from "@heroicons/react/24/outline";
import { type MintTestResults } from "./types";
import {
  CartesianGrid,
  Tooltip,
  YAxis,
  Line,
  LineChart,
  XAxis,
  Legend,
} from "recharts";
import { bundlerTypeStyles, getUrlType } from "./utils/urlType";

type Config = {
  privateKey: string;
  bundlerUrl: string;
  paymasterUrl: string;
}[];

const getBundlerType = (config: Config, index: number) =>
  getUrlType(config[index]?.bundlerUrl || "");

export const Results = ({
  mintTestResults,
  config,
  resultNames,
}: {
  mintTestResults: MintTestResults[];
  config: Config;
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
    [key: string]: string | number | undefined;
  }[] = [];
  dataMap[0]?.forEach((element, elementIndex) => {
    data.push({
      name: element.name,
      ...mintTestResults
        .map((_, index) => {
          return {
            [`${getBundlerType(config, index)}`]:
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
        <h2>Results:</h2>
        <div className="flex flex-col gap-2 my-2">
          {mintTestResults.map((results, index) => (
            <div key={index} className="flex w-full gap-2 items-center">
              <div
                className={`text-xs flex-shrink-0  w-24 text-center  text-white py-2 rounded-md ${
                  bundlerTypeStyles[getBundlerType(config, index)]
                }`}
              >
                {getBundlerType(config, index)}
              </div>
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
      </div>
      <LineChart width={1000} height={300} data={data} margin={{ top: 50 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          label={{ value: "Time (ms)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip formatter={(value) => `${value} ms`} />
        <Legend />
        {mintTestResults.map((_, index) => (
          <Line
            key={index}
            type="monotone"
            label={getBundlerType(config, index)}
            dataKey={`${getBundlerType(config, index)}`}
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
