import { ReactNode } from 'react';
import React from 'react';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LeftSidebar from '@/components/left-sidebar';
import RightSidebar from '@/components/right-sidebar';
import PlayerBar from '@/components/player-bar';
import { PlaybackProvider } from '../playback-context';
import { getFavouritePlaylist, getPlaylists } from '@/lib/playlist';
import { PlaylistProvider } from '../playlists-context';

export default async function RootLayout({ children }: { children: ReactNode }) {
	const user = await getUser();
	if (!user) redirect('/login');

	const playlists = await getPlaylists();
	const favourites = await getFavouritePlaylist();

	return (
		<React.Fragment>
			<PlaybackProvider>
				<PlaylistProvider playlists={playlists || []} favourites={favourites?.tracks.map((track) => track.id) || []}>
					<div className="flex">
						<LeftSidebar user={user} playlists={playlists} />
						<main className="flex-1 h-[calc(100svh-6rem)]">{children}</main>
						<RightSidebar />
					</div>
					<PlayerBar />
				</PlaylistProvider>
			</PlaybackProvider>
		</React.Fragment>
	);
}
