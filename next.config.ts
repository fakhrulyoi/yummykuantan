import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // forbidden() dan unauthorized() untuk admin (403 dan 401).
  experimental: { authInterrupts: true },
};

export default nextConfig;
