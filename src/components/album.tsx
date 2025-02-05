'use client';
import { Album, Page, SimplifiedTrack } from '@spotify/web-api-ts-sdk';
import { Play, Heart, MoreHorizontal, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import moment from 'moment';
import { usePlayback } from '@/app/playback-context';
import { TrackItem } from './TrackItem';

export function AlbumComponents({ album }: { album: { data: Album; tracks: Page<SimplifiedTrack> } }) {
	const { setPlaylist, playTrack } = usePlayback();

	const tracksData = album.tracks.items.map((track) => ({
		id: track.id,
		name: track.name,
		artists: track.artists.map((artist) => ({ id: artist.id, name: artist.name })),
		images: album.data.images,
		album: { id: album.data.id, name: album.data.name },
		duration: track.duration_ms / 1000,
	}));

	const onPlayAlbum = () => {
		setPlaylist(tracksData);
		playTrack(tracksData[0]);
	};

	const totalDuration = moment.utc(album.tracks.items.reduce((total, track) => total + track.duration_ms, 0)).format('mm:ss');

	return (
		<div className="w-full h-full p-4 sm:p-6 bg-neutral-900">
			<div className="max-w-7xl mx-auto h-full">
				<div className="flex sm:flex-row flex-col gap-4 sm:gap-6 mb-6">
					<div className="flex flex-row sm:flex-row gap-4 sm:gap-6 items-center">
						<div className="relative flex-shrink-0">
							<Image src={album.data.images[0].url} alt={album.data.name} width={200} height={200} className="w-28 h-28 sm:w-52 sm:h-52 object-cover rounded-lg shadow-lg transition-transform hover:scale-105" />
							<div className="absolute inset-0 bg-black/20 rounded-lg hover:opacity-0 transition-opacity"></div>
						</div>
						<div className="flex flex-col justify-center text-left sm:flex-1">
							<h1 className="text-xl sm:text-3xl font-bold text-white line-clamp-2 break-words">{album.data.name}</h1>
							<div className="text-gray-400 space-y-1">
								<div className="flex items-center gap-2 flex-wrap">
									{album.data.artists.map((artist, index) => (
										<div key={artist.id} className="flex items-center gap-2">
											<Link href={`/artist/${artist.id}`} className="text-sm sm:text-base hover:underline hover:text-white">
												{artist.name}
											</Link>
											{index < album.data.artists.length - 1 && <span>•</span>}
										</div>
									))}
								</div>
								<p className="text-xs sm:text-sm">
									{album.data.release_date} • {album.data.total_tracks} tracks • {totalDuration}
								</p>
							</div>
							<div className="hidden sm:flex items-center mt-4 gap-3">
								<button onClick={onPlayAlbum} className="bg-orange-500 text-white rounded-full px-4 sm:px-6 py-2 hover:bg-orange-400 transition-colors flex items-center gap-2 group">
									<Play size={16} fill="currentColor" className="group-hover:animate-pulse" />
									Play
								</button>
								<div className="flex items-center gap-2">
									<button className="text-gray-400 hover:text-white transition-colors">
										<Heart size={20} />
									</button>
									<button className="text-gray-400 hover:text-white transition-colors">
										<Plus size={20} />
									</button>
									<button className="text-gray-400 hover:text-white transition-colors">
										<MoreHorizontal size={20} />
									</button>
								</div>
							</div>
						</div>
					</div>

					<div className="sm:hidden rounded-lg px-3 flex items-center justify-between">
						<button onClick={onPlayAlbum} className="bg-orange-500 text-white rounded-full px-4 py-2 hover:bg-orange-400 transition-colors flex items-center gap-2 group">
							<Play size={16} fill="currentColor" className="group-hover:animate-pulse" />
							Play
						</button>
						<div className="flex items-center gap-2">
							<button className="text-gray-400 hover:text-white transition-colors">
								<Heart size={20} />
							</button>
							<button className="text-gray-400 hover:text-white transition-colors">
								<Plus size={20} />
							</button>
							<button className="text-gray-400 hover:text-white transition-colors">
								<MoreHorizontal size={20} />
							</button>
						</div>
					</div>
				</div>

				<div className="space-y-2 h-[calc(100%-14rem)]">
					<div className="grid grid-cols-[auto,1fr,auto] gap-4 px-4 py-2 text-xs text-gray-400 border-b border-gray-800">
						<span className="w-6 text-center">#</span>
						<span>Title</span>
						<span>Duration</span>
					</div>
					<ScrollArea className="w-full h-full">
						{tracksData.map((track, index) => (
							<TrackItem key={track.id} track={track} index={index} config={{ index: true, name: true, duration: true, actions: true }} />
						))}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
