'use server';

import { Error } from '@/components/error';
import { PlaylistComponents } from '@/components/playlist';
import { getFavouritePlaylist } from '@/lib/playlist';
import { AlertCircle } from 'lucide-react';

export default async function FavouritePage() {
	try {
		const playlist = await getFavouritePlaylist();
		if (!playlist) return <Error text="Playlist not found" subText="The playlist you are looking for does not exist" Icon={AlertCircle} color="text-yellow-500" />;

		return <PlaylistComponents playlist={playlist} />;
	} catch (error) {
		console.error('Search page error:', error);
		return <Error text="Something went wrong" subText="We couldn't complete your search. Please try again later" Icon={AlertCircle} color="text-red-500" />;
	}
}
