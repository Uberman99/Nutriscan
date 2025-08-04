import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
    optimizeCss: false, // Disable lightningcss
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'd2eawub7utcl6.cloudfront.net',
      },
    ],
  },
  // Ensure proper CSS handling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      
      // Add Tesseract.js worker configuration
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      });
    }
    
    // Ignore tesseract.js worker files to prevent bundling issues
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('tesseract.js');
    }
    
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    
    return config;
  },
};

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default nextConfig;
