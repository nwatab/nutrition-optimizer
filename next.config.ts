import type { NextConfig } from 'next';

// basePath は単一の情報源から取る（client の withBasePath と同じ値）。
import { BASE_PATH } from './src/lib/base-path';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: BASE_PATH,
  images: { unoptimized: true },
  staticPageGenerationTimeout: 180,
};

export default nextConfig;
