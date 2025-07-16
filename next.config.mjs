/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode:false,
  images:{
    domains:['big-ghastly-imp.ngrok-free.app'],
    unoptimized:true,
    remotePatterns:[
      {
        protocol:'https',
        hostname:'big-ghastly-imp.ngrok-free.app'
      }
    ]
  }
};

export default nextConfig;
