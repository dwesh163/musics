'use client';
import { User } from 'next-auth';
import { ListMusic, Heart, Clock, History, Plus, Search, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
	{ id: 'feed', icon: Home, label: 'Feed', href: '/' },
	{ id: 'playlists', icon: ListMusic, label: 'Playlists', href: '/playlists' },
	{ id: 'search', icon: Search, label: 'Search', href: '/search' },
];

const yourMusicItems = [
	{ id: 'favourites', icon: Heart, label: 'Favourites', href: '/favourites' },
	{ id: 'later', icon: Clock, label: 'Listen Later', href: '/listen-later' },
	{ id: 'history', icon: History, label: 'History', href: '/history' },
];

const playlists = [
	{ id: 'metalcore', label: 'Metalcore', color: 'bg-red-500', href: '/playlist/metalcore' },
	{ id: 'electro', label: 'Electro', color: 'bg-green-500', href: '/playlist/electro' },
	{ id: 'funk', label: 'Funk', color: 'bg-yellow-500', href: '/playlist/funk' },
	{ id: 'disco', label: 'Disco', color: 'bg-purple-500', href: '/playlist/disco' },
];

export default function Sidebar({ user }: { user: User }) {
	const pathname = usePathname();
	const router = useRouter();

	const isSearchRelatedRoute = (path: string) => {
		return ['/search', '/artist', '/album'].some((route) => path.startsWith(route));
	};

	const MenuItem = ({
		item,
		isPlaylist = false,
	}: {
		item: {
			id: string;
			icon?: React.ComponentType<{ size: number }>;
			label: string;
			href: string;
			color?: string;
		};
		isPlaylist?: boolean;
	}) => {
		const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) || (item.href === '/search' && isSearchRelatedRoute(pathname));

		const Icon = item.icon;

		return (
			<Link href={item.href} className={`flex items-center gap-3 cursor-pointer transition-colors ${isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-300'}`}>
				{isPlaylist ? <span className={`w-2 h-2 ${item.color} rounded-full`}></span> : Icon && <Icon size={20} />}
				{item.label}
			</Link>
		);
	};

	return (
		<aside className="w-64 lg:w-72 p-6 flex-col gap-8 border-r border-gray-800 h-screen sticky top-0 overflow-y-auto hidden md:flex">
			<div className="flex justify-between items-center">
				<Link href="/" className="text-4xl font-black tracking-wider">
					MUSICS
				</Link>
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
						{menuItems.map((item) => (
							<li key={item.id}>
								<MenuItem item={item} />
							</li>
						))}
					</ul>
				</div>

				<div>
					<h2 className="text-xs uppercase text-gray-400 font-medium mb-4">Your Music</h2>
					<ul className="space-y-3">
						{yourMusicItems.map((item) => (
							<li key={item.id}>
								<MenuItem item={item} />
							</li>
						))}
					</ul>
				</div>

				<div>
					<h2 className="text-xs uppercase text-gray-400 font-medium mb-4">Your Playlists</h2>
					<ul className="space-y-3">
						{playlists.map((playlist) => (
							<li key={playlist.id}>
								<MenuItem item={playlist} isPlaylist={true} />
							</li>
						))}
					</ul>
				</div>

				<button onClick={() => router.push('/create-playlist')} className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
					<Plus size={20} />
					Create new playlist
				</button>
			</nav>
		</aside>
	);
}
