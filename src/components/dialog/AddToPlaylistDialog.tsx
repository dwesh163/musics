import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Music2, Plus } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { cn } from '@/lib/utils';
import { usePlaylist } from '@/app/playlists-context';
import { usePathname } from 'next/navigation';

export const AddToPlaylistDialog = ({ trackId }: { trackId: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	const { playlists, addToPlaylist } = usePlaylist();

	const pathname = usePathname();
	const playlistId = pathname?.startsWith('/playlist/') ? pathname.split('/')[2] : null;

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<button className="text-gray-400 sm:hover:text-white">
					<Plus size={14} className="sm:size-4" />
				</button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add to Playlist</DialogTitle>
				</DialogHeader>
				<ScrollArea className="h-[300px]">
					{playlists
						.filter((playlist) => playlist.id != playlistId)
						.map(({ id, name, images, duration, length }) => (
							<Button
								key={id}
								variant="ghost"
								className="w-full h-15 px-2.5 justify-start text-left mb-1 hover:bg-card/90"
								onClick={() => {
									addToPlaylist(id, trackId);
									setIsOpen(false);
								}}>
								<div className="flex items-center gap-3">
									{images.length > 0 ? (
										<div
											className={cn('relative flex-shrink-0 overflow-hidden rounded shadow-lg w-10 h-10 grid gap-0', {
												'grid-cols-1': images.length === 1,
												'grid-cols-2': images.length === 2 || images.length === 4,
												'grid-cols-2 grid-rows-2': images.length === 3,
											})}>
											{images.slice(0, 4).map((image, index) => (
												<img
													key={index}
													src={image}
													alt={name}
													width={50}
													height={50}
													className={cn('object-cover', {
														'w-full h-full': images.length !== 3,
														'col-span-2 row-span-1': images.length === 3 && index === 0,
														'col-span-1 row-span-1': images.length === 3 && index > 0,
													})}
												/>
											))}
										</div>
									) : (
										<div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
											<Music2 className="w-1/3 h-1/3 text-zinc-600" />
										</div>
									)}
									<div className="text-left">
										<h1 className="text-lg font-bold text-white line-clamp-2">{name}</h1>
										<p className="text-xs text-gray-400">
											{length} tracks • {moment.utc(duration * 1000).format('HH:mm:ss')}
										</p>
									</div>
								</div>
							</Button>
						))}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};
