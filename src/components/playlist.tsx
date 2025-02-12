'use client';
import { Play, Heart, MoreHorizontal, Plus, Music2 } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import moment from 'moment';
import { usePlayback } from '@/app/playback-context';
import { TrackItem } from './TrackItem';
import { PlaylistType } from '@/types/playlist';
import { cn } from '@/lib/utils';

export function PlaylistComponents({ playlist }: { playlist: PlaylistType }) {
	const { setPlaylist, playTrack } = usePlayback();

	console.log(playlist.tracks);
	const onPlayPlaylist = () => {
		setPlaylist(playlist.tracks);
		console.log(playlist.tracks[0]);
		playTrack(playlist.tracks[0]);
	};

	const totalDuration = moment.utc(playlist.tracks.reduce((total, track) => total + track.duration, 0) * 1000).format('HH:mm:ss');

	return (
		<div className="w-full h-full p-4 sm:p-6 bg-neutral-900">
			<div className="max-w-7xl mx-auto h-full">
				<div className="flex sm:flex-row flex-col gap-4 sm:gap-6 mb-6">
					<div className="flex flex-row sm:flex-row gap-4 sm:gap-6 items-center">
						{playlist.images.length > 0 ? (
							<div
								className={cn('relative flex-shrink-0 overflow-hidden rounded-md shadow-lg w-32 h-32 grid gap-0', {
									'grid-cols-1': playlist.images.length === 1,
									'grid-cols-2': playlist.images.length === 2 || playlist.images.length === 4,
									'grid-cols-2 grid-rows-2': playlist.images.length === 3,
								})}>
								{playlist.images.slice(0, 4).map((image, index) => (
									<Image
										key={index}
										src={image}
										alt={playlist.name}
										width={128}
										height={128}
										className={cn('object-cover', {
											'w-full h-full': playlist.images.length !== 3,
											'col-span-2 row-span-1': playlist.images.length === 3 && index === 0,
											'col-span-1 row-span-1': playlist.images.length === 3 && index > 0,
										})}
									/>
								))}
							</div>
						) : (
							<div className="w-32 h-32 bg-zinc-800 rounded-md flex items-center justify-center">
								<Music2 className="w-1/3 h-1/3 text-zinc-600" />
							</div>
						)}
						<div className="flex flex-col justify-center text-left sm:flex-1">
							<h1 className="text-xl sm:text-3xl font-bold text-white line-clamp-2 break-words">{playlist.name}</h1>
							<div className="text-gray-400 space-y-1">
								<p className="text-xs sm:text-sm">
									{playlist.tracks.length} tracks • {totalDuration}
								</p>
							</div>
							<div className="flex items-center mt-4 gap-3">
								<button onClick={onPlayPlaylist} className="bg-orange-500 text-white rounded-full px-4 sm:px-6 py-2 hover:bg-orange-400 transition-colors flex items-center gap-2 group">
									<Play size={16} fill="currentColor" className="group-hover:animate-pulse" />
									Play
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="space-y-2 h-[calc(100%-14rem)]">
					<div className="grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
						<span className="w-5 text-center">#</span>
						<span>Title</span>
						<span>Duration</span>
					</div>
					<ScrollArea className="w-full h-[calc(100%-2rem)]">
						{playlist.tracks.map((track, index) => (
							<TrackItem key={track.id} track={track} index={index} config={{ index: true, name: true, duration: true, play: true, image: true, artists: true, album: true, actions: true }} />
						))}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
