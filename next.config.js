/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // yahoo-finance2 ships dev-test files that webpack tries to resolve.
    // Marking it server-external lets Node require() it natively.
    serverComponentsExternalPackages: ["yahoo-finance2"],
  },
};

module.exports = nextConfig;
