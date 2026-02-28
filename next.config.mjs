/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Allow PDF uploads in admin book form (Vercel serverless max ~4.5MB)
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
