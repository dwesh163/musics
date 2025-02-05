import React, { useState } from 'react';
import { Heart, Plus, MoreHorizontal, Share2, ListMusic, Ban, Play } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { PlaylistDialog } from './dialog/PlaylistDialog';
import { usePlayback } from '@/app/playback-context';
import { Track } from '@spotify/web-api-ts-sdk';
import moment from 'moment';
import Image from 'next/image';
import { SimplifiedTrack } from '@/types/track';
import { useRouter } from 'next/navigation';

interface TrackItemConfig {
	index?: boolean;
	image?: boolean;
	name?: Boolean;
	artists?: Boolean;
	album?: Boolean;
	duration?: boolean;
	play?: boolean;
	actions?: boolean;
}

export function TrackItem({
	track,
	index = 0,
	config = {
		index: false,
		image: true,
		name: true,
		artists: true,
		album: true,
		duration: true,
		play: true,
		actions: true,
	},
}: {
	track: Track | SimplifiedTrack;
	index?: number;
	config?: TrackItemConfig;
}) {
	const [isLiked, setIsLiked] = useState(false);
	const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
	const { playTrack } = usePlayback();

	const router = useRouter();

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

	const handlePlayTrack = () => {
		if (trackData) {
			playTrack(trackData);
		}
	};

	const handleShare = () => {
		console.log('Share track:', trackData);
	};

	const handleGoToAlbum = () => {
		router.push(`/album/${trackData?.album.id}`);
	};

	const handleGoToArtist = () => {
		router.push(`/artist/${trackData?.artists[0]?.id}`);
	};

	const handleBlockTrack = () => {
		console.log('Block track:', trackData);
	};

	return (
		<div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-gray-800/50 rounded-lg group">
			{config.index && <span className="w-3 text-right text-gray-400">{index + 1}</span>}

			{config.image && (
				<div className="relative flex-shrink-0">
					<Image src={trackData.images?.[0]?.url || '/placeholder.png'} alt={trackData.name} width={48} height={48} className="rounded object-cover w-12 h-12 sm:w-14 sm:h-14" />
				</div>
			)}

			{(config.name || config.artists || config.album) && (
				<div className="flex-1 min-w-0 pr-2">
					{config.name && <h3 className="font-medium truncate max-w-[50vw]">{trackData.name}</h3>}
					{(config.artists || config.album) && (
						<p className="text-xs sm:text-sm text-gray-400 truncate max-w-[50vw]">
							{config.artists && trackData.artists.map((artist) => artist.name).join(', ')} {config.artists && config.album && '•'} {config.album && trackData.album.name}
						</p>
					)}
				</div>
			)}

			{config.duration && <p className="text-xs hidden sm:flex sm:w-1/3 w-1/12 sm:text-sm text-gray-400">{moment.utc(trackData.duration * 1000).format('mm:ss')}</p>}

			<div className="flex items-center gap-2">
				{config.play && (
					<button onClick={handlePlayTrack} className="mr-2 text-gray-400 hover:text-white bg-orange-500 hover:bg-orange-400 rounded-full p-2 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
						<Play size={14} className="sm:size-4 text-white" fill="currentColor" />
					</button>
				)}

				{config.actions && (
					<>
						<button className="text-gray-400 hover:text-white" onClick={() => setIsLiked(!isLiked)}>
							<Heart size={14} className={`sm:size-4 ${isLiked ? 'fill-current text-orange-500' : ''}`} />
						</button>

						<PlaylistDialog
							isOpen={showPlaylistDialog}
							onOpenChange={setShowPlaylistDialog}
							trigger={
								<button className="text-gray-400 hover:text-white">
									<Plus size={14} className="sm:size-4" />
								</button>
							}
						/>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="text-gray-400 hover:text-white">
									<MoreHorizontal size={14} className="sm:size-4" />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem onSelect={handleShare}>
									<Share2 className="mr-2 size-4" />
									Share
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={handleGoToAlbum}>
									<ListMusic className="mr-2 size-4" />
									Go to album
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={handleGoToArtist}>
									<ListMusic className="mr-2 size-4" />
									Go to artist
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onSelect={handleBlockTrack} className="text-red-500">
									<Ban className="mr-2 size-4" />
									Don't play this
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}
			</div>
		</div>
	);
}
