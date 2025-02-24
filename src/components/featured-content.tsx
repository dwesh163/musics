'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

export default function FeaturedContent() {
	useEffect(() => {
		if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
			navigator.serviceWorker
				.register('/sw.js')
				.then((registration) => console.log('Service Worker registered with scope:', registration.scope))
				.catch((err) => console.error('Service Worker registration failed:', err));
		} else {
			console.log('Service Worker not supported');
		}
	}, []);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div className="bg-gradient-to-br from-purple-900/90 to-gray-900 p-6 rounded-xl">
				<div className="mb-4">
					<p className="text-sm text-gray-400">69 tracks • 4 hours 37 minutes</p>
					<h2 className="text-2xl font-bold mt-1">Playlist of the day</h2>
				</div>
				<Image src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=500&h=500&q=80" alt="Playlist Cover" width={200} height={200} className="rounded-lg shadow-lg" />
			</div>

			<div className="bg-gradient-to-br from-blue-900/90 to-gray-900 p-6 rounded-xl relative overflow-hidden">
				<Image src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&h=600&q=80" alt="Featured Track" layout="fill" objectFit="cover" className="opacity-40" />
				<div className="relative z-10">
					<p className="text-sm text-gray-300">Brand of Sacrifice • April, 2023</p>
					<h2 className="text-2xl font-bold mt-1">Between Death and Dreams</h2>
					<button className="mt-4 bg-white text-black rounded-full p-3 hover:bg-gray-100">
						<Play size={24} />
					</button>
				</div>
			</div>
		</div>
	);
}
