import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', 
  webpack: (config) => {
      config.resolve.alias = {
          ...config.resolve.alias,
          "sharp$": false,
          "onnxruntime-node$": false,
      }
      return config;
  },
};

export default nextConfig;
