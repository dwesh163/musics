import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{ protocol: 'https', hostname: 'images.unsplash.com' },
			{ protocol: 'https', hostname: 'i.scdn.co' },
			{ protocol: 'https', hostname: 'mosaic.scdn.co' },
			{ protocol: 'https', hostname: 'image-cdn-ak.spotifycdn.com' },
		],
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
				],
			},
			{
				source: '/sw.js',
				headers: [
					{
						key: 'Cache-Control',
						value: 'no-cache, no-store, must-revalidate',
					},
					{
						key: 'Service-Worker-Allowed',
						value: '/',
					},
				],
			},
		];
	},
};

export default nextConfig;
