import { BundlerTypes } from "../types";

export const getUrlType = (url: string): BundlerTypes => {
  if (url.includes("zerodev")) return "zerodev";
  if (url.includes("pimlico")) return "pimlico";
  return "unknown";
};

export const bundlerTypeStyles = {
  zerodev: "bg-green-500",
  pimlico: "bg-blue-900",
  unknown: "bg-gray-600",
};
