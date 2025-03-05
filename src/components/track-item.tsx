import React from 'react';
import { Heart, Plus, MoreHorizontal, Share2, ListMusic, Ban, Play, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AddToPlaylistDialog } from './dialog/AddToPlaylistDialog';
import { usePlayback } from '@/app/playback-context';
import { Track } from '@spotify/web-api-ts-sdk';
import moment from 'moment';
import Image from 'next/image';
import { SimplifiedTrack } from '@/types/track';
import { useRouter, usePathname } from 'next/navigation';
import { usePlaylist } from '@/app/playlists-context';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { AddToPlaylistSheet } from './sheet/AddToPlaylist';

interface TrackItemConfig {
	index?: boolean;
	image?: boolean;
	name?: boolean;
	artists?: boolean;
	album?: boolean;
	duration?: boolean;
	play?: boolean;
	actions?: boolean;
}

interface TrackItemProps {
	track: Track | SimplifiedTrack;
	index?: number;
	config?: TrackItemConfig;
}

const DEFAULT_CONFIG: TrackItemConfig = {
	index: false,
	image: true,
	name: true,
	artists: true,
	album: true,
	duration: true,
	play: true,
	actions: true,
};

export function TrackItem({ track, index = 0, config = DEFAULT_CONFIG }: TrackItemProps) {
	const { playlist, playTrack, setPlaylist } = usePlayback();
	const { favourites, addToFavourites, removeFromFavourites, removeFromPlaylist } = usePlaylist();
	const router = useRouter();
	const pathname = usePathname();

	const [isPlaylistSheetOpen, setIsPlaylistSheetOpen] = useState(false);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const playlistId = pathname?.startsWith('/playlist/') ? pathname.split('/')[2] : null;
	const trackData =
		'duration_ms' in track
			? {
					id: track.id,
					name: track.name,
					artists: track.artists.map((artist) => ({ id: artist.id, name: artist.name })),
					album: { id: track.album.id, name: track.album.name },
					duration: track.duration_ms / 1000,
					images: track.album.images,
			  }
			: track;

	if (!trackData) return null;

	const handlePlayTrack = () => trackData && playTrack(trackData);
	const handleGoToAlbum = () => router.push(`/album/${trackData.album.id}`);
	const handleGoToArtist = () => trackData.artists[0]?.id && router.push(`/artist/${trackData.artists[0].id}`);
	const handleAddToQueue = () => {
		setPlaylist([...playlist, trackData]);
		setIsSheetOpen(false);
	};
	const handleAddToPlaylist = () => {
		setIsPlaylistSheetOpen(true);
		setIsSheetOpen(false);
	};

	return (
		<div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 sm:hover:bg-gray-800/50 rounded-[calc(var(--radius) * 2)] group">
			{config.index && <span className="w-6 text-center text-gray-400">{index + 1}</span>}
			{config.image && (
				<div className="relative flex-shrink-0">
					<img src={trackData.images?.[0]?.url || '/placeholder.png'} alt={trackData.name} width={100} height={100} className="rounded-[calc(var(--radius) * 1.5)] object-cover w-16 h-w-16 sm:w-14 sm:h-14" />
					{config.play && (
						<button onClick={handlePlayTrack} className="absolute inset-0 flex items-center justify-center text-white  sm:hidden bg-black bg-opacity-50">
							<Play size={24} className="text-white" fill="currentColor" />
						</button>
					)}
				</div>
			)}

			{(config.name || config.artists || config.album) && (
				<div className="flex-1 min-w-0 pr-2">
					{config.name && <h3 className="font-semibold -mb-0.5 sm:mn-0 text-base truncate max-w-[50vw]">{trackData.name}</h3>}
					{(config.artists || config.album) && (
						<p className="text-sm text-gray-400 truncate max-w-[50vw]">
							{config.artists && trackData.artists.map((artist) => artist.name).join(', ')}
							{config.artists && config.album && ' • '}
							{config.album && trackData.album.name}
						</p>
					)}
				</div>
			)}

			{config.duration && <p className="text-xs hidden sm:flex sm:w-1/3 w-1/12 sm:text-sm text-gray-400">{moment.utc(trackData.duration * 1000).format('mm:ss')}</p>}

			<div className="flex items-center gap-2">
				{config.play && (
					<button onClick={handlePlayTrack} className="mr-2 text-gray-400 hover:text-white bg-primary hover:bg-primary/90 hidden sm:flex rounded-full p-2 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<Play size={14} className="size-4 text-white" fill="currentColor" />
					</button>
				)}

				{config.actions && (
					<>
						<button className="text-gray-400 sm:hover:text-white" onClick={() => (favourites.includes(trackData.id) ? removeFromFavourites(trackData.id) : addToFavourites(trackData.id))}>
							<Heart size={14} className={cn('size-4', favourites.includes(trackData.id) && 'fill-current text-primary')} />
						</button>

						<div className="hidden sm:flex gap-2">
							<AddToPlaylistDialog trackId={trackData.id} />

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="text-gray-400 sm:hover:text-white focus-visible:outline-none focus-visible:ring-0 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
										<MoreHorizontal size={14} className="sm:size-4" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-52">
									{!track.album?.id?.startsWith('G-') && (
										<DropdownMenuItem className="cursor-pointer focus:bg-white/5" onSelect={handleGoToAlbum}>
											<ListMusic className="size-4" />
											Go to album
										</DropdownMenuItem>
									)}
									{!track.artists[0]?.id?.startsWith('G-') && (
										<DropdownMenuItem className="cursor-pointer focus:bg-white/5" onSelect={handleGoToArtist}>
											<ListMusic className="size-4" />
											Go to artist
										</DropdownMenuItem>
									)}
									<DropdownMenuItem className="cursor-pointer focus:bg-white/5" onSelect={handleGoToArtist}>
										<ListMusic className="size-4" />
										Go to artist
									</DropdownMenuItem>
									<DropdownMenuItem className="cursor-pointer focus:bg-white/5" onSelect={handleAddToQueue}>
										<Play className="size-4" />
										Add to queue
									</DropdownMenuItem>
									{playlistId && <DropdownMenuSeparator />}
									{playlistId && (
										<DropdownMenuItem onSelect={() => removeFromPlaylist(playlistId, trackData.id)} className="text-red-500 hover:bg-red-500 hover:bg-opacity-10 focus:bg-red-500 focus:bg-opacity-10 focus:text-red-500 cursor-pointer">
											<Trash2 className="size-4" />
											Remove from playlist
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Mobile View */}
						<div className="flex sm:hidden">
							<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
								<SheetTrigger className="text-gray-400 focus:outline-none">
									<MoreHorizontal size={14} className="size-5" />
								</SheetTrigger>
								<SheetContent className="p-6 px-4 mt-2 max-h-[70vh] overflow-y-auto [&>button]:hidden bg-card" side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
									<SheetHeader>
										<SheetTitle></SheetTitle>
									</SheetHeader>
									<div className="flex items-center">
										<img src={trackData.images?.[0]?.url || '/placeholder.png'} alt={trackData.name} width={100} height={100} className="rounded-[calc(var(--radius) * 1.5)] object-cover w-14 h-w-14" />
										<div className="flex-1 min-w-0 pl-3">
											<h3 className="font-semibold -mb-0.5 sm:mn-0 text-base truncate max-w-[50vw]">{trackData.name}</h3>
											<p className="text-sm text-gray-400 truncate max-w-[50vw]">
												{trackData.artists.map((artist) => artist.name).join(', ')} • {trackData.album.name}
											</p>
										</div>
										<p className="text-xs sm:w-1/3 w-1/12 sm:text-sm text-gray-400">{moment.utc(trackData.duration * 1000).format('mm:ss')}</p>
									</div>
									<hr className="my-4 border-gray-800" />

									<div className="flex flex-col gap-4">
										<div className="flex items-center gap-2 cursor-pointer" onClick={handleGoToAlbum}>
											<ListMusic className="size-4" />
											Go to album
										</div>
										<div className="flex items-center gap-2 cursor-pointer" onClick={handleGoToArtist}>
											<ListMusic className="size-4" />
											Go to artist
										</div>
										<div className="flex items-center gap-2 cursor-pointer" onClick={handleAddToQueue}>
											<Play className="size-4" />
											Add to queue
										</div>
										<div className="flex items-center gap-2 cursor-pointer" onClick={handleAddToPlaylist}>
											<Plus size={14} className="size-4" />
											Add to Playlist
										</div>
										{playlistId && (
											<div className="flex items-center gap-2 cursor-pointer text-red-500" onClick={() => removeFromPlaylist(playlistId, trackData.id)}>
												<Trash2 className="size-4" />
												Remove from playlist
											</div>
										)}
									</div>
								</SheetContent>
							</Sheet>
							<AddToPlaylistSheet trackId={trackData.id} isOpen={isPlaylistSheetOpen} setIsOpen={setIsPlaylistSheetOpen} />
						</div>
					</>
				)}
			</div>
		</div>
	);
}
