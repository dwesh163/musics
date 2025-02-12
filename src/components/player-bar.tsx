'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Shuffle, Repeat, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { usePlayback } from '@/app/playback-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SimplifiedTrack } from '@/types/track';
import { usePlaylist } from '@/app/playlists-context';

const removeParenthesesContent = (text: string) => text.replace(/\([^)]{17,}\)/g, '');

const TrackInfo = ({ currentTrack }: { currentTrack: SimplifiedTrack }) => {
	const { favourites, addToFavourites, removeFromFavourites } = usePlaylist();
	return (
		<div className="flex items-center gap-4 w-96">
			<Image src={currentTrack?.images[0].url} alt="Now Playing" width={56} height={56} className="rounded" />
			<div>
				<h4 className="font-medium">{removeParenthesesContent(currentTrack?.name)}</h4>
				<p className="text-sm text-gray-400">
					{currentTrack?.artists.slice(0, 2).map((artist, index) => (
						<span key={artist.id}>
							<Link href={`/artist/${artist.id}`} className="hover:underline">
								{removeParenthesesContent(artist.name)}
							</Link>
							{index < currentTrack.artists.slice(0, 2).length - 1 && ', '}
						</span>
					))}{' '}
					•{' '}
					<Link href={`/album/${currentTrack.album.id}`} className="hover:underline">
						{removeParenthesesContent(currentTrack.album.name)}
					</Link>
				</p>
			</div>
			<button onClick={() => (favourites.includes(currentTrack.id) ? removeFromFavourites(currentTrack.id) : addToFavourites(currentTrack.id))}>
				<Heart className={cn('ml-2 text-orange-500', favourites.includes(currentTrack.id) ? 'fill-current' : 'hover:fill-current')} size={20} />
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
	const [volume, setVolume] = useState(100);
	const [isMuted, setIsMuted] = useState(false);
	let volumeBarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = isMuted ? 0 : volume / 100;
		}
	}, [volume, isMuted, audioRef]);

	const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
		if (volumeBarRef.current) {
			const rect = volumeBarRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
			setVolume(percentage);
			if (audioRef.current) {
				audioRef.current.volume = percentage / 100;
			}
			setIsMuted(percentage === 0);
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
		<div className="w-96 items-center justify-end pr-4 gap-2 md:flex hidden">
			<Button variant="ghost" size="icon" className="hover:bg-opacity-50" onClick={toggleMute} disabled={!currentTrack}>
				{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
			</Button>
			<div ref={volumeBarRef} className="w-24 h-1 bg-gray-700 rounded-full cursor-pointer" onClick={handleVolumeChange}>
				<div className="h-full bg-white rounded-full" style={{ width: `${volume}%` }} />
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
		<div className="flex flex-col items-center gap-2 flex-1 max-w-2xl px-4 w-full">
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

export default function PlayerBar() {
	const { currentTrack, audioRef, isLoading, setIsLoading, setIsPlaying, playTrack } = usePlayback();

	const checkSong = async (currentTrack: SimplifiedTrack) => {
		try {
			const response = await fetch(`/api/track/${currentTrack?.id}/song?check=true`);
			if (!response.ok) {
				setIsLoading(true);
				setIsPlaying(false);

				const download = await fetch(`/api/track/${currentTrack?.id}/download`, {
					method: 'POST',
				});

				if (download.ok) {
					setIsLoading(false);
					playTrack(currentTrack);
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
		<div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
			<audio ref={audioRef} />
			<div className={cn('flex items-center flex-col sm:flex-row gap-4', currentTrack ? 'justify-between' : 'justify-center')}>
				{currentTrack && <TrackInfo currentTrack={currentTrack} />}
				<PlayerControls />
				{currentTrack && <VolumeControl />}
			</div>
		</div>
	);
}
