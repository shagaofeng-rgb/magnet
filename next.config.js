/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    useWasmBinary: true
  },
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

module.exports = nextConfig;
