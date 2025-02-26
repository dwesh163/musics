import React, { useState } from 'react';
import { usePlayback } from '@/app/playback-context';
import { ListMusic, Play, Pause, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

function formatDuration(duration: number): string {
	const minutes = Math.floor(duration / 60);
	const seconds = Math.floor(duration % 60);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function removeParenthesesContent(text: string): string {
	return text.replace(/\([^)]{17,}\)/g, '');
}

function Track({ track, currentTrack, playTrack, isPlaying }: any) {
	return (
		<div className={cn('flex items-center gap-3 p-3 sm:hover:bg-gray-800 transition-colors', currentTrack?.id === track.id && 'bg-card/90')}>
			<div className="relative group flex-shrink-0">
				<Image src={track.images[0].url} alt={track.name} width={40} height={40} className="rounded" />
				<button onClick={() => playTrack(track)} className={cn('absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity', currentTrack?.id === track.id && 'opacity-100')}>
					{currentTrack?.id === track.id && isPlaying ? <Pause size={20} /> : <Play size={20} />}
				</button>
			</div>

			<div className="flex-grow min-w-0">
				<p className="font-medium truncate">{removeParenthesesContent(track.name)}</p>
				<p className="text-sm text-gray-400 truncate">
					{track.artists.slice(0, 2).map((artist: any, i: number) => (
						<span key={artist.id}>
							<Link href={`/artist/${artist.id}`} className="hover:underline">
								{removeParenthesesContent(artist.name)}
							</Link>
							{i < track.artists.slice(0, 2).length - 1 && ', '}
						</span>
					))}
				</p>
			</div>

			<span className="text-sm text-gray-400 flex-shrink-0">{formatDuration(track.duration)}</span>
		</div>
	);
}

function QueueContent({ playlist, currentTrack, isPlaying, playTrack }: any) {
	if (playlist.length === 0) {
		return (
			<div className="sm:h-96 h-[70vh] p-4 text-center flex justify-center items-center text-gray-400">
				<p>Queue is empty</p>
			</div>
		);
	}

	return (
		<div className="sm:max-h-96 max-h-[70vh] pb-16 overflow-y-auto">
			{playlist.map((track: any) => (
				<Track key={track.id} track={track} currentTrack={currentTrack} playTrack={playTrack} isPlaying={isPlaying} />
			))}
		</div>
	);
}

export function QueueView() {
	const { playlist, currentTrack, isPlaying, playTrack } = usePlayback();
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isDesktopOpen, setIsDesktopOpen] = useState(false);

	return (
		<div className="flex items-center">
			{/* Mobile and desktop buttons */}
			<button className="text-gray-400 hidden sm:flex hover:text-white" onClick={() => setIsDesktopOpen(!isDesktopOpen)}>
				<ListMusic size={20} />
			</button>

			<button className="text-gray-400 sm:hidden" onClick={() => setIsMobileOpen(!isMobileOpen)}>
				<ListMusic size={20} />
			</button>

			{/* Mobile Sheet */}
			<div className="flex sm:hidden">
				<Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
					<SheetHeader>
						<SheetTitle></SheetTitle>
					</SheetHeader>
					<SheetContent side="bottom" className="h-[70dvh] p-0 [&>button]:hidden sm:hidden">
						<div className="p-4 border-b border-gray-800 flex justify-between items-center">
							<h3 className="font-semibold">Current Queue</h3>
							<button onClick={() => setIsMobileOpen(false)}>
								<ChevronDown size={20} />
							</button>
						</div>
						<QueueContent playlist={playlist} currentTrack={currentTrack} isPlaying={isPlaying} playTrack={playTrack} />
					</SheetContent>
				</Sheet>
			</div>

			{/* Desktop Floating Box */}
			<div className={cn('fixed bottom-24 md:bottom-20 right-0 md:right-4 w-full md:w-80 bg-card border-t md:border border-gray-800 md:rounded-lg shadow-lg transition-all duration-300 ease-in-out z-40', isDesktopOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none', 'hidden md:block')}>
				<div className="p-4 border-b border-gray-800 flex justify-between items-center">
					<h3 className="font-semibold">Current Queue</h3>
					<Button variant="ghost" size="sm" onClick={() => setIsDesktopOpen(false)}>
						<ChevronDown size={20} />
					</Button>
				</div>
				<QueueContent playlist={playlist} currentTrack={currentTrack} isPlaying={isPlaying} playTrack={playTrack} />
			</div>
		</div>
	);
}
