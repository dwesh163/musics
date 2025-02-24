'use server';

import { Error } from '@/components/error';
import { PlaylistComponent } from '@/components/playlist';
import { getPlaylist } from '@/lib/playlist';
import { AlertCircle } from 'lucide-react';

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
	try {
		const id = (await params)?.id;
		const playlist = await getPlaylist(id);

		if (!playlist) {
			return <Error text="Playlist not found" subText="The playlist you are looking for does not exist" Icon={AlertCircle} color="text-yellow-500" />;
		}

		return <PlaylistComponent playlist={playlist} />;
	} catch (error) {
		console.error('Playlist page error:', error);
		return <Error text="Something went wrong" subText="We couldn't complete your request. Please try again later" Icon={AlertCircle} color="text-red-500" />;
	}
}
