import { withTypedHandlers } from "typed-handlers/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withTypedHandlers(nextConfig, { legacy: true });
