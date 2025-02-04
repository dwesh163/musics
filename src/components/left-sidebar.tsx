'use client';

import { User } from 'next-auth';
import { ListMusic, BarChart2, Heart, Clock, History, Mic2, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Sidebar({ user }: { user: User }) {
	return (
		<aside className="w-64 lg:w-72 p-6 flex-col gap-8 border-r border-gray-800 h-screen sticky top-0 overflow-y-auto hidden md:flex">
			<div className="flex justify-between items-center">
				<h1 className="text-4xl font-black tracking-wider">MUSICS</h1>
				<div className="flex items-center gap-4">
					<Avatar className="border shadow-sm w-8 h-8 lg:w-8 lg:h-8">
						<AvatarImage src={user.image} alt={user.name} />
						<AvatarFallback>
							{user.name
								?.split(' ')
								.map((word) => word.charAt(0).toUpperCase())
								.join('')}
						</AvatarFallback>
					</Avatar>
				</div>
			</div>

			<nav className="space-y-8">
				<div>
					<h2 className="text-xs uppercase text-gray-400 font-medium mb-4">Menu</h2>
					<ul className="space-y-3">
						<li className="flex items-center gap-3 text-orange-500">
							<ListMusic size={20} />
							Feed
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<ListMusic size={20} />
							Playlists
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<BarChart2 size={20} />
							Statistics
						</li>
					</ul>
				</div>

				<div>
					<h2 className="text-xs uppercase text-gray-400 font-medium mb-4">Your Music</h2>
					<ul className="space-y-3">
						<li className="flex items-center gap-3 text-gray-400">
							<Heart size={20} />
							Favourites
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<Clock size={20} />
							Listen Later
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<History size={20} />
							History
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<Mic2 size={20} />
							Podcasts
						</li>
					</ul>
				</div>

				<div>
					<h2 className="text-xs uppercase text-gray-400 font-medium mb-4">Your Playlists</h2>
					<ul className="space-y-3">
						<li className="flex items-center gap-3 text-gray-400">
							<span className="w-2 h-2 bg-red-500 rounded-full"></span>
							Metalcore
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<span className="w-2 h-2 bg-green-500 rounded-full"></span>
							Electro
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
							Funk
						</li>
						<li className="flex items-center gap-3 text-gray-400">
							<span className="w-2 h-2 bg-purple-500 rounded-full"></span>
							Disco
						</li>
					</ul>
				</div>

				<button className="flex items-center gap-2 text-orange-500">
					<Plus size={20} />
					Create new playlist
				</button>
			</nav>
		</aside>
	);
}
