'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Shuffle, Repeat, Loader2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { usePlayback } from '@/app/playback-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SimplifiedTrack } from '@/types/track';
import { usePlaylist } from '@/app/playlists-context';
import { QueueView } from './queue-view';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';

const removeParenthesesContent = (text: string) => text.replace(/\([^)]{17,}\)/g, '');

const formatTime = (time: number) => {
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60);
	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TrackInfo = ({ currentTrack, onOpen }: { currentTrack: SimplifiedTrack; onOpen: () => void }) => {
	const { favourites, addToFavourites, removeFromFavourites } = usePlaylist();
	const { isPlaying, isLoading, togglePlayPause } = usePlayback();
	return (
		<div className="flex items-center justify-between sm:gap-4 gap-2 sm:w-96 w-full h-12 sm:h-full" onClick={onOpen}>
			<div className="flex items-center gap-2">
				<img src={currentTrack?.images[0].url} alt="Now Playing" width={100} height={100} className="h-10 w-10 sm:h-14 sm:w-14 rounded-[var(--radius)]" />
				<div>
					<h4 className="font-medium sm:text-base text-sm">{removeParenthesesContent(currentTrack?.name)}</h4>
					<p className="sm:text-sm text-xs text-gray-400">
						{currentTrack?.artists.slice(0, 2).map((artist, index) => (
							<span key={artist.id}>
								<Link href={`/artist/${artist.id}`} className="hover:underline">
									{removeParenthesesContent(artist.name)}
								</Link>
								{index < currentTrack.artists.slice(0, 2).length - 1 && ', '}
							</span>
						))}{' '}
						<span className="hidden sm:inline">• </span>
						<Link href={`/album/${currentTrack.album.id}`} className="hover:underline hidden sm:inline">
							{removeParenthesesContent(currentTrack.album.name)}
						</Link>
					</p>
				</div>
				<button className="z-50" onClick={() => (favourites.includes(currentTrack.id) ? removeFromFavourites(currentTrack.id) : addToFavourites(currentTrack.id))}>
					<Heart className={cn('ml-2 text-primary', favourites.includes(currentTrack.id) ? 'fill-current' : 'hover:fill-current')} size={20} />
				</button>
			</div>
			<button className="text-primary-foreground flex sm:hidden" onClick={togglePlayPause} disabled={!currentTrack}>
				{isLoading ? <Loader2 className="animate-spin" size={24} /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
			</button>
		</div>
	);
};

function ProgressBar() {
	let { currentTime, duration, audioRef, setCurrentTime } = usePlayback();
	let progressBarRef = useRef<HTMLDivElement>(null);

	let formatTime = (time: number) => {
		let minutes = Math.floor(time / 60);
		let seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	let handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
		if (progressBarRef.current && audioRef.current) {
			let rect = progressBarRef.current.getBoundingClientRect();
			let x = e.clientX - rect.left;
			let percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
			let newTime = (percentage / 100) * duration;
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	return (
		<div className="flex items-center w-full mt-1">
			<span className="text-xs tabular-nums text-gray-400">{formatTime(currentTime)}</span>
			<div ref={progressBarRef} className="flex-grow mx-2 h-1 bg-[#3E3E3E] rounded-full cursor-pointer relative" onClick={handleProgressChange}>
				<div
					className="absolute top-0 left-0 h-full bg-white rounded-full"
					style={{
						width: `${(currentTime / duration) * 100}%`,
					}}></div>
			</div>
			<span className="text-xs tabular-nums text-gray-400">{formatTime(duration)}</span>
		</div>
	);
}

const VolumeControl = () => {
	const { audioRef, currentTrack } = usePlayback();
	const [volume, setVolume] = useState(80);
	const [isMuted, setIsMuted] = useState(false);
	const [pointerPosition, setPointerPosition] = useState(80);
	const [isHovered, setIsHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const volumeBarRef = useRef<HTMLDivElement>(null);
	const invisibleDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = isMuted ? 0 : volume / 100;
		}
	}, [volume, isMuted, audioRef]);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isDragging && volumeBarRef.current) {
			const rect = volumeBarRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
			setPointerPosition(percentage);
			setVolume(percentage);
			if (audioRef.current) {
				audioRef.current.volume = percentage / 100;
			}
			setIsMuted(percentage === 0);
		}
	};

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		setIsDragging(true);
		handleMouseMove(e);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
		if (isDragging) {
			setIsDragging(false);
		}
	};

	const toggleMute = () => {
		if (audioRef.current) {
			if (isMuted) {
				audioRef.current.volume = volume / 100;
				setIsMuted(false);
			} else {
				audioRef.current.volume = 0;
				setIsMuted(true);
			}
		}
	};

	return (
		<div className="w-96 items-center justify-end pr-4 gap-3 md:flex hidden">
			<button className="text-gray-400 hover:text-white" onClick={toggleMute} disabled={!currentTrack}>
				{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
			</button>
			<div ref={invisibleDivRef} className="w-24 h-6 bg-transparent flex justify-center items-center cursor-pointer" onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} onMouseEnter={() => setIsHovered(true)}>
				<div ref={volumeBarRef} className="relative w-24 h-1 bg-gray-700 rounded-full" onMouseEnter={() => setIsHovered(true)}>
					<div className={`h-full ${isHovered || isDragging ? 'bg-blue-500' : 'bg-white'} rounded-full`} style={{ width: `${pointerPosition}%` }} />
				</div>
			</div>
		</div>
	);
};

const PlayerControls = () => {
	let { currentTrack, audioRef, isPlaying, duration, isLoading, setCurrentTime, setDuration, playPreviousTrack, playNextTrack, togglePlayPause } = usePlayback();

	useEffect(() => {
		let audio = audioRef.current;
		if (audio) {
			let updateTime = () => setCurrentTime(audio.currentTime);
			let updateDuration = () => setDuration(currentTrack?.duration || 0);

			audio.addEventListener('timeupdate', updateTime);
			audio.addEventListener('loadedmetadata', updateDuration);

			return () => {
				audio.removeEventListener('timeupdate', updateTime);
				audio.removeEventListener('loadedmetadata', updateDuration);
			};
		}
	}, [audioRef, currentTrack, setCurrentTime, setDuration]);

	useEffect(() => {
		if ('mediaSession' in navigator && currentTrack) {
			navigator.mediaSession.metadata = new MediaMetadata({
				title: currentTrack.name,
				artist: currentTrack.artists
					.slice(0, 2)
					.map((artist) => artist.name)
					.join(', '),
				album: currentTrack.album.name || undefined,
				artwork: currentTrack.images.map((image) => ({
					src: image.url,
					sizes: image.width + 'x' + image.height,
					type: 'image/png',
				})),
			});

			navigator.mediaSession.setActionHandler('play', () => {
				audioRef.current?.play();
				togglePlayPause();
			});

			navigator.mediaSession.setActionHandler('pause', () => {
				audioRef.current?.pause();
				togglePlayPause();
			});

			navigator.mediaSession.setActionHandler('previoustrack', playPreviousTrack);
			navigator.mediaSession.setActionHandler('nexttrack', playNextTrack);

			navigator.mediaSession.setActionHandler('seekto', (details) => {
				if (audioRef.current && details.seekTime !== undefined) {
					audioRef.current.currentTime = details.seekTime;
					setCurrentTime(details.seekTime);
				}
			});

			const updatePositionState = () => {
				if (audioRef.current && !isNaN(audioRef.current.duration)) {
					try {
						navigator.mediaSession.setPositionState({
							duration: audioRef.current.duration,
							playbackRate: audioRef.current.playbackRate,
							position: audioRef.current.currentTime,
						});
					} catch (error) {
						console.error('Error updating position state:', error);
					}
				}
			};

			const handleLoadedMetadata = () => {
				updatePositionState();
			};

			audioRef.current?.addEventListener('timeupdate', updatePositionState);
			audioRef.current?.addEventListener('loadedmetadata', handleLoadedMetadata);

			return () => {
				audioRef.current?.removeEventListener('timeupdate', updatePositionState);
				audioRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
				navigator.mediaSession.setActionHandler('play', null);
				navigator.mediaSession.setActionHandler('pause', null);
				navigator.mediaSession.setActionHandler('previoustrack', null);
				navigator.mediaSession.setActionHandler('nexttrack', null);
				navigator.mediaSession.setActionHandler('seekto', null);
			};
		}
	}, [currentTrack, playPreviousTrack, playNextTrack, togglePlayPause, audioRef, setCurrentTime]);

	return (
		<div className="sm:flex hidden flex-col items-center gap-2 flex-1 max-w-2xl px-4 w-full">
			<div className="flex items-center gap-6">
				<Shuffle size={20} className="text-gray-400 hidden sm:block" />
				<button onClick={playPreviousTrack} className="cursor-pointer hover:text-gray-300" disabled={!currentTrack}>
					<SkipBack size={24} />
				</button>
				<button className="bg-white text-black rounded-full p-2 hover:bg-gray-300 cursor-pointer" onClick={togglePlayPause} disabled={!currentTrack}>
					{isLoading ? <Loader2 className="animate-spin" size={24} /> : isPlaying ? <Pause size={24} /> : <Play size={24} />}
				</button>
				<button onClick={playNextTrack} className="cursor-pointer hover:text-gray-300" disabled={!currentTrack}>
					<SkipForward size={24} />
				</button>
				<Repeat size={20} className="text-gray-400 hidden sm:block" />
			</div>
			<div className="w-full flex items-center gap-3">
				<ProgressBar />
			</div>
		</div>
	);
};

const FullPlayer = ({ onClose }: { onClose: () => void }) => {
	const { audioRef, currentTime, duration, setCurrentTime, playPreviousTrack, playNextTrack, togglePlayPause } = usePlayback();
	const { currentTrack, isPlaying } = usePlayback();

	const [volume, setVolume] = useState(100);

	const handleSeek = (value: number[]) => {
		if (audioRef.current) {
			const newTime = (value[0] / 100) * duration;
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	const handleVolumeChange = (value: number[]) => {
		if (audioRef.current) {
			const newVolume = value[0] / 100;
			audioRef.current.volume = newVolume;
			setVolume(value[0]);
		}
	};

	return (
		<div className="flex flex-col h-full pt-8">
			<div className="flex justify-between items-center px-4">
				<button onClick={onClose}>
					<ChevronDown size={24} />
				</button>
				<QueueView />
			</div>

			<div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
				<img src={currentTrack?.images[0]?.url || '/default-image.png'} alt="Now Playing" width={280} height={280} className="rounded-lg shadow-xl" />

				<div className="w-full text-center">
					<h3 className="text-xl font-bold mb-2">{removeParenthesesContent(currentTrack?.name ?? '')}</h3>
					<p className="text-gray-400">
						{currentTrack?.artists.map((artist, i) => (
							<span key={artist.id}>
								<Link href={`/artist/${artist.id}`} className="hover:underline">
									{artist.name}
								</Link>
								{i < currentTrack.artists.length - 1 && ', '}
							</span>
						))}
					</p>
				</div>

				<div className="w-full space-y-2">
					<Slider value={[(currentTime / duration) * 100]} onValueChange={handleSeek} max={100} step={1} className="w-full" />
					<div className="flex justify-between text-sm text-gray-400">
						<span>{formatTime(currentTime)}</span>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				<div className="flex items-center justify-center gap-8">
					<button onClick={playPreviousTrack} className="h-12 w-12 flex items-center justify-center">
						<SkipBack size={24} />
					</button>

					<button onClick={togglePlayPause} className="h-16 w-16 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center">
						{isPlaying ? <Pause size={64} className="size-7" /> : <Play size={64} className="size-7" />}
					</button>

					<button onClick={playNextTrack} className="h-12 w-12 flex items-center justify-center">
						<SkipForward size={24} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default function PlayerBar() {
	const { currentTrack, audioRef, playlist, isPlaying, setIsLoading, setIsPlaying, playTrack } = usePlayback();
	const [isOpen, setIsOpen] = useState(false);

	const checkSong = async (track: SimplifiedTrack) => {
		try {
			const response = await fetch(`/api/track/${track?.id}/song?check=true`);
			if (!response.ok) {
				setIsLoading(true);
				setIsPlaying(false);

				const download = await fetch(`/api/track/${track?.id}/download`, {
					method: 'POST',
				});

				if (download.ok) {
					setIsLoading(false);
					if (currentTrack?.id === track.id) {
						playTrack(track);
					}
				} else {
					console.error('Error downloading song:', download);
				}
			}
		} catch (error) {
			console.error('Error check song', error);
		}
	};

	useEffect(() => {
		if (currentTrack) {
			checkSong(currentTrack);
		}
	}, [currentTrack]);

	return (
		<div className={cn('fixed bottom-12 sm:bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 ', currentTrack ? 'p-4' : 'sm:p-4')}>
			<audio ref={audioRef} />
			<Sheet open={isOpen} onOpenChange={setIsOpen}>
				<SheetHeader>
					<SheetTitle></SheetTitle>
				</SheetHeader>
				<SheetContent side="bottom" className="h-[100dvh] p-0 [&>button]:hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
					<FullPlayer onClose={() => setIsOpen(false)} />
				</SheetContent>
			</Sheet>
			<div className={cn('flex items-center flex-col sm:flex-row gap-4', currentTrack ? 'justify-between' : 'justify-center')}>
				{currentTrack && <TrackInfo currentTrack={currentTrack} onOpen={() => setIsOpen(true)} />}
				<PlayerControls />
				{currentTrack && (
					<div className="hidden sm:flex justify-between w-96">
						<QueueView />
						<VolumeControl />
					</div>
				)}
			</div>
		</div>
	);
}
