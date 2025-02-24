import React from 'react';
import { Home, Search, Library, Radio, Heart, UsersRound, User, UserRound } from 'lucide-react';
import Link from 'next/link';

export function MobileNavBar() {
	return (
		<div className="fixed sm:hidden bottom-0 left-0 right-0 bg-gray-900 h-12">
			<nav className="flex justify-between items-center px-2 py-3">
				<Link href="/" className="flex flex-col items-center px-3">
					<Home size={24} className="text-gray-400" />
				</Link>

				<Link href="/playlists" className="flex flex-col items-center px-3">
					<Library size={24} className="text-gray-400" />
				</Link>

				<Link href="/search" className="flex flex-col items-center px-3">
					<Search size={24} className="text-gray-400" />
				</Link>

				<Link href="/users" className="flex flex-col items-center px-3">
					<UsersRound size={24} className="text-gray-400" />
				</Link>

				<Link href="/me" className="flex flex-col items-center px-3">
					<UserRound size={24} className="text-gray-400" />
				</Link>
			</nav>
		</div>
	);
}
