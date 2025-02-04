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

	return (
		<div className="w-full h-full p-6">
			<div className="h-full mx-auto">
				<div className="flex flex-col md:flex-row gap-8 mb-8">
					<div className="flex-shrink-0">
						<Image src={album.data.images[0].url} alt={album.data.name} width={300} height={300} className="rounded-lg shadow-xl" />
					</div>
					<div className="flex flex-col justify-end">
						<h1 className="text-4xl font-bold mb-4">{album.data.name}</h1>
						<div className="text-gray-400 space-y-2">
							{album.data.artists.map((artist) => (
								<Link key={artist.id} href={`/artist/${artist.id}`} className="text-lg hover:underline">
									{artist.name}
								</Link>
							))}
							<p>
								{album.data.release_date} • {album.data.total_tracks} songs • {moment.utc(album.tracks.items.reduce((total, track) => total + track.duration_ms, 0)).format('mm:ss')}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4 mb-8">
					<button onClick={() => onPlayAlbum()} className="bg-orange-500 text-white rounded-full px-8 py-3 hover:bg-orange-400 transition-colors flex items-center gap-2">
						<Play size={20} fill="currentColor" />
						Play
					</button>
					<button className="text-gray-400 hover:text-white">
						<Heart size={24} />
					</button>
					<button className="text-gray-400 hover:text-white">
						<Plus size={24} />
					</button>
					<button className="text-gray-400 hover:text-white">
						<MoreHorizontal size={24} />
					</button>
				</div>

				<div className="space-y-1 h-[calc(100%-24rem)]">
					<div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
						<span className="w-3">#</span>
						<span>Title</span>
					</div>
					<ScrollArea className="w-full h-full">
						{tracksData.map((track, index) => (
							<TrackItem key={track.id} track={track} index={index} config={{ index: true, name: true, actions: true }} />
						))}
					</ScrollArea>
				</div>
			</div>
		</div>
	);
}
