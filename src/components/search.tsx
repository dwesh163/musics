'use client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Artist, PartialSearchResult, SimplifiedAlbum, Track } from '@spotify/web-api-ts-sdk';
import { SearchResultItem } from './search-result-item';
import { TrackItem } from './track-item';

export function SearchResults({ results }: { results: Required<Pick<PartialSearchResult, 'artists' | 'albums' | 'tracks'>> }) {
	const renderResultSection = (title: string | null, items: any[], renderItem: (item: any) => React.ReactNode) => {
		if (items.length === 0) return null;

		return (
			<section className="space-y-2">
				{title && <h2 className="text-base sm:text-lg font-bold text-orange-500 mb-2 sm:mb-4">{title}</h2>}
				{items.map(renderItem)}
			</section>
		);
	};

	const renderTrack = (track: Track) => <TrackItem key={`album-${track.id}`} track={track} />;

	const renderAlbum = (album: SimplifiedAlbum) => <SearchResultItem key={`album-${album.id}`} image={album.images[0]?.url} title={album.name} subtitle={`${album.artists.map((artist) => artist.name).join(', ')} • ${album.release_date}`} linkHref={`/album/${album.id}`} />;

	const renderArtist = (artist: Artist) => <SearchResultItem key={`artist-${artist.id}`} image={artist.images?.[0]?.url} title={artist.name} subtitle={`${artist.followers?.total} followers`} linkHref={`/artist/${artist.id}`} />;

	return (
		<ScrollArea className="w-full h-[calc(100vh-8rem)] sm:h-[calc(100%-10rem)]">
			<div className="space-y-4 sm:space-y-6 p-1 sm:p-2 w-full">
				{renderResultSection(null, results.tracks.items, renderTrack)}
				{renderResultSection('Albums', results.albums.items, renderAlbum)}
				{renderResultSection('Artists', results.artists.items, renderArtist)}
			</div>
		</ScrollArea>
	);
}
