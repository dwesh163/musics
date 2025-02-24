'use client';

import { Play, Music2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { ScrollArea } from './ui/scroll-area';
import moment from 'moment';
import { usePlayback } from '@/app/playback-context';
import { TrackItem } from './track-item';
import { PlaylistType } from '@/types/playlist';
import { cn } from '@/lib/utils';

export function PlaylistComponent({ playlist }: { playlist: PlaylistType }) {
	const { setPlaylist, playTrack } = usePlayback();
	const [isScrolled, setIsScrolled] = useState(false);
	const headerRef = useRef<HTMLDivElement>(null);

	const onPlayPlaylist = () => {
		setPlaylist(playlist.tracks);
		playTrack(playlist.tracks[0]);
	};

	const totalDuration = moment.utc(playlist.tracks.reduce((total, track) => total + track.duration, 0) * 1000).format('HH:mm:ss');

	const handleScroll = (e: any) => {
		if (!headerRef.current) return;
		const scrollTop = e.target.scrollTop;
		setIsScrolled(scrollTop > headerRef.current.offsetHeight);
	};

	const MainContent = () => (
		<div className="flex flex-col">
			<div ref={headerRef} className="flex flex-col gap-6 p-6 px-5">
				<div className="flex items-start sm:gap-6 gap-4">
					{playlist.images.length > 0 ? (
						<div
							className={cn('relative flex-shrink-0 overflow-hidden rounded-[calc(var(--radius) * 1.5)] shadow-lg w-32 h-32 sm:h-48 sm:w-48 grid gap-0', {
								'grid-cols-1': playlist.images.length === 1,
								'grid-cols-2': playlist.images.length === 2 || playlist.images.length === 4,
								'grid-cols-2 grid-rows-2': playlist.images.length === 3,
							})}>
							{playlist.images.slice(0, 4).map((image, index) => (
								<img
									key={index}
									src={image}
									alt={'Image ' + (index + 1)}
									width={200}
									height={200}
									className={cn('object-cover', {
										'w-full h-full': playlist.images.length !== 3,
										'col-span-2 row-span-1': playlist.images.length === 3 && index === 0,
										'col-span-1 row-span-1': playlist.images.length === 3 && index > 0,
									})}
								/>
							))}
						</div>
					) : (
						<div className="flex h-32 w-32 sm:h-48 sm:w-48 items-center justify-center bg-neutral-800">
							<Music2 className="h-20 w-20 text-neutral-400" />
						</div>
					)}

					<div className="flex flex-col">
						<h1 className="text-2xl sm:text-3xl sm:mt-3 font-bold truncate w-[calc(100svw-12rem)] sm:w-min text-white">{playlist.name}</h1>
						<p className="text-sm text-neutral-400">
							{playlist.tracks.length} tracks • {totalDuration}
						</p>
						<button onClick={onPlayPlaylist} className="flex items-center gap-2 bg-primary sm:hover:bg-primary/90 sm:px-7 sm:py-3 px-5 py-2 mt-3 font-semibold text-primary-foreground w-fit">
							<Play className="h-6 w-6" /> Play
						</button>
					</div>
				</div>
			</div>

			<div className="flex-1 space-y-2 p-3 pt-0">
				<div className="flex justify-between sm:px-2 text-sm font-semibold text-neutral-400">
					<div className="">Title</div>
					<div className="text-left w-min hidden">Duration</div>
					<div className="text-right pr-6 hidden">Action</div>
				</div>

				{playlist.tracks
					.sort((a, b) => (a.addedAt?.getTime() ?? 0) - (b.addedAt?.getTime() ?? 0))
					.reverse()
					.map((track, index) => (
						<TrackItem key={track.id} track={track} index={index} />
					))}
			</div>
		</div>
	);

	return (
		<>
			<div className={cn('md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform', isScrolled ? 'translate-y-0 bg-gradient-to-b from-background to-card shadow-lg border-b border-white/10' : '-translate-y-full')}>
				<div className="flex items-center justify-between px-4 py-3">
					<h1 className="text-lg font-bold text-white truncate">{playlist.name}</h1>
					<button onClick={onPlayPlaylist} className="flex items-center gap-1 bg-primary px-2 py-1.5 text-sm font-semibold text-primary-foreground">
						<Play className="h-4 w-4" />
					</button>
				</div>
			</div>

			<ScrollArea className="h-full" onScrollCapture={handleScroll}>
				<MainContent />
			</ScrollArea>
		</>
	);
}
