'use client';

import { Artist, Page, SimplifiedAlbum, TopTracksResult } from '@spotify/web-api-ts-sdk';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from './ui/scroll-area';
import { TrackItem } from './track-item';

export function ArtistComponents({ artist }: { artist: { data: Artist; topTracks: TopTracksResult; albums: Page<SimplifiedAlbum> } }) {
	return (
		<div className="w-full h-full">
			<div className="relative h-[200px]">
				<Image src={artist?.data?.images[0]?.url} alt={artist.data.name} fill className="object-cover brightness-50" />
				<div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
					<div className="max-w-6xl mx-auto">
						<h1 className="text-6xl font-bold sm:mb-3">{artist.data.name}</h1>
						<p className="text-gray-300 text-lg">{artist.data.followers?.total?.toLocaleString()} Followers</p>
					</div>
				</div>
			</div>

			<div className="sm:p-6 sm:pb-6 p-3 sm:h-[calc(100%-200px)] pb-24">
				<ScrollArea className="w-full h-full">
					<section className="mb-12">
						<h2 className="text-2xl font-bold sm:mb-6 mb-2">Popular</h2>
						<div className="space-y-2">
							{artist.topTracks.tracks.map((track, index) => (
								<TrackItem key={track.id} track={track} />
							))}
						</div>
					</section>

					<section className="mb-10">
						<h2 className="text-2xl font-bold mb-6">Albums</h2>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
							{artist.albums.items.map((album) => (
								<Link key={album.id} href={`/album/${album.id}`} className="group">
									<div className="relative aspect-square mb-4">
										<Image src={album.images[0].url} alt={album.name} fill className="object-cover rounded-lg" />
										<button className="absolute bottom-4 right-4 bg-orange-500 text-white rounded-full p-3 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
											<Play size={20} fill="currentColor" />
										</button>
									</div>
									<h3 className="font-medium truncate hover:underline">{album.name}</h3>
									<p className="text-sm text-gray-400">
										{album.release_date} • {album.total_tracks} songs
									</p>
								</Link>
							))}
						</div>
					</section>
				</ScrollArea>
			</div>
		</div>
	);
}
