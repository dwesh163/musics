'use server';
import { getRightSidebarData } from '@/lib/sidebar';
import { Heart, MoreVertical, ChevronRight, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Error } from './error';
import { Artist, NewReleases as NewReleasesType, SimplifiedAlbum } from '@spotify/web-api-ts-sdk';
import { SimplifiedTrack } from '@/types/track';

const NewReleases = async ({ newReleases }: { newReleases: NewReleasesType | null }) => {
	if (!newReleases) {
		return <Error text="Something went wrong" subText="Failed to get new releases" Icon={AlertCircle} color="text-red-500" />;
	}

	if (newReleases.albums.items.length === 0) {
		return;
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xs uppercase text-gray-400 font-medium">New Releases</h2>
			</div>
			<div className="space-y-4">
				{newReleases.albums.items.slice(0, 5).map((album) => (
					<AlbumItem key={album.id} album={album} />
				))}
			</div>
		</div>
	);
};

const AlbumItem = ({ album }: { album: SimplifiedAlbum }) => (
	<div className="flex items-center gap-3">
		<Image src={album.images[0]?.url || '/placeholder.png'} width={40} height={40} alt={album.name} className="w-10 h-10 rounded flex-shrink-0 object-cover" />
		<div className="min-w-0 flex-1">
			<Link href={`/album/${album.id}`} className="hover:underline">
				<h3 className="font-medium truncate">{album.name}</h3>
			</Link>
			<p className="text-xs text-gray-400 truncate">
				Album •{' '}
				{album.artists
					.slice(0, 1)
					.map((artist) => artist.name)
					.join(', ')}{' '}
				• {album.release_date}
			</p>
		</div>
	</div>
);

const ListenMoreOften = ({ listenMoreOften }: { listenMoreOften?: SimplifiedTrack[] }) => {
	if (!listenMoreOften) {
		return <Error text="Something went wrong" subText="Failed to get tracks" Icon={AlertCircle} color="text-red-500" />;
	}

	if (listenMoreOften.length === 0) {
		return;
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xs uppercase text-gray-400 font-medium">Listen More Often</h2>
			</div>
			<div className="space-y-4">
				{listenMoreOften.map((track) => (
					<div key={track.id} className="flex items-center gap-3 group">
						<Image src={track.images[0].url || '/placeholder.png'} width={40} height={40} alt={track.name} className="w-10 h-10 rounded flex-shrink-0 object-cover" />
						<div className="min-w-0 flex-1">
							<h3 className="font-medium truncate">{track.name}</h3>
							<p className="text-xs text-gray-400 truncate">
								{track.artists
									.slice(0, 2)
									.map((artist) => artist.name)
									.join(', ')}{' '}
								• {track.album.name}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const FavouriteArtists = ({ favouriteArtists }: { favouriteArtists?: Artist[] }) => {
	if (!favouriteArtists) {
		return <Error text="Something went wrong" subText="Failed to get favourite artists" Icon={AlertCircle} color="text-red-500" />;
	}

	if (favouriteArtists.length === 0) {
		return;
	}

	return (
		<div>
			<h2 className="text-xs uppercase text-gray-400 font-medium mb-4">Favourite Artists</h2>
			<div className="space-y-4">
				{favouriteArtists.map((artist, index) => (
					<ArtistItem key={artist.id} artist={artist} rank={index + 1} />
				))}
			</div>
		</div>
	);
};

const ArtistItem = ({ artist, rank }: { artist: Artist; rank: number }) => (
	<div className="flex items-center gap-3">
		<div className="w-6 text-2xl font-bold text-gray-700">{rank}</div>
		<Image src={artist.images[0].url || '/placeholder.png'} width={40} height={40} alt={artist.name} className="w-10 h-10 rounded flex-shrink-0 object-cover" />
		<div className="min-w-0 flex-1">
			<h3 className="font-medium truncate">{artist.name}</h3>
			<p className="text-xs text-gray-400 truncate">{artist.followers.total} Subscribers</p>
		</div>
		<Link href={`/artist/${artist.id}`} className="text-gray-400 hover:text-gray-200">
			<ChevronRight size={16} />
		</Link>
	</div>
);

export default async function RightSidebar() {
	const data = await getRightSidebarData();

	if (!data) {
		return <Error text="Something went wrong" subText="Failed to get sidebar data" Icon={AlertCircle} color="text-red-500" />;
	}

	return (
		<aside className="w-80 p-6 border-l border-gray-800 hidden 2xl:block h-screen sticky top-0 overflow-y-auto">
			<div className="space-y-8">
				<NewReleases newReleases={data.newReleases || null} />
				<ListenMoreOften listenMoreOften={data.listenMoreOften || null} />
				<FavouriteArtists favouriteArtists={data.favouriteArtists || null} />
			</div>
		</aside>
	);
}
