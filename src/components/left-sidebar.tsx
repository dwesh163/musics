'use client';
import { User } from 'next-auth';
import { ListMusic, Heart, Clock, History, Search, Home, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlaylistsType } from '@/types/playlist';
import { Error } from './error';
import { cn } from '@/lib/utils';
import { CreatePlaylistDialog } from './dialog/CreatePlaylistDialog';

const menuItems = [
	{ id: 'feed', icon: Home, label: 'Feed', href: '/' },
	{ id: 'playlists', icon: ListMusic, label: 'Playlists', href: '/playlists' },
	{ id: 'search', icon: Search, label: 'Search', href: '/search' },
];

const yourMusicItems = [
	{ id: 'favourites', icon: Heart, label: 'Favourites', href: '/favourites' },
	{ id: 'history', icon: History, label: 'History', href: '/history' },
];

const colors = ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-blue-500', 'bg-indigo-500', 'bg-pink-500', 'bg-cyan-500', 'bg-rose-500', 'bg-amber-500'];

export default function Sidebar({ user, playlists }: { user: User; playlists: PlaylistsType[] | null }) {
	const pathname = usePathname();

	const isSearchRelatedRoute = (path: string) => {
		return ['/search', '/artist', '/album'].some((route) => path.startsWith(route));
	};

	const MenuItem = ({
		item,
	}: {
		item: {
			id: string;
			icon?: React.ComponentType<{ size: number }>;
			label: string;
			href: string;
			color?: string;
		};
	}) => {
		const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) || (item.href === '/search' && isSearchRelatedRoute(pathname));

		const Icon = item.icon;

		return (
			<Link href={item.href} className={cn('flex items-center gap-3 cursor-pointer transition-colors', isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-300')}>
				{Icon && <Icon size={20} />}
				{item.label}
			</Link>
		);
	};

	const PlaylistItem = ({ playlist, index }: { playlist: PlaylistsType; index: number }) => {
		return (
			<Link href={`/playlist/${playlist.id}`} className="flex items-center gap-3 cursor-pointer transition-colors text-gray-400 hover:text-gray-300">
				<span className={cn('w-2 h-2 rounded-full', colors[index])}></span>
				{playlist.name}
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
					{!playlists ? (
						<Error text="Something went wrong" subText="Failed to get playlists" Icon={AlertCircle} color="text-red-500" />
					) : (
						<ul className="space-y-3">
							{playlists.map((playlist, index) => (
								<li key={playlist.id}>
									<PlaylistItem playlist={playlist} index={index} />
								</li>
							))}
						</ul>
					)}
					<CreatePlaylistDialog />
				</div>
			</nav>
		</aside>
	);
}
