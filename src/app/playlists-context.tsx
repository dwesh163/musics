'use client';

import { PlaylistsType } from '@/types/playlist';
import { useRouter } from 'next/navigation';
import { createContext, useContext, ReactNode } from 'react';

type PlaylistContextType = {
	playlists: PlaylistsType[];
	addToPlaylist: (playlistId: string, trackId: string) => void;
	removeFromPlaylist: (playlistId: string, trackId: string) => void;
	favourites: string[];
	addToFavourites: (trackId: string) => void;
	removeFromFavourites: (trackId: string) => void;
};

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children, playlists, favourites }: { children: ReactNode; playlists: PlaylistsType[]; favourites: string[] }) {
	const router = useRouter();

	const addToPlaylist = async (playlistId: string, trackId: string) => {
		const response = await fetch(`/api/playlist/${playlistId}`, {
			method: 'POST',
			body: JSON.stringify({ trackId }),
		});

		if (!response.ok) {
			console.error('Failed to add track to playlist');
			return;
		}

		router.refresh();
		return;
	};

	const removeFromPlaylist = async (playlistId: string, trackId: string) => {
		const response = await fetch(`/api/playlist/${playlistId}`, {
			method: 'DELETE',
			body: JSON.stringify({ trackId }),
		});

		if (!response.ok) {
			console.error('Failed to remove track from playlist');
			return;
		}

		router.refresh();
		return;
	};

	const addToFavourites = async (trackId: string) => {
		const response = await fetch(`/api/favourites`, {
			method: 'POST',
			body: JSON.stringify({ trackId }),
		});

		if (!response.ok) {
			console.error('Failed to add track to favourites');
			return;
		}

		router.refresh();
		return;
	};

	const removeFromFavourites = async (trackId: string) => {
		const response = await fetch(`/api/favourites`, {
			method: 'DELETE',
			body: JSON.stringify({ trackId }),
		});

		if (!response.ok) {
			console.error('Failed to remove track from favourites');
			return;
		}

		router.refresh();
		return;
	};

	return (
		<PlaylistContext.Provider
			value={{
				playlists,
				addToFavourites,
				removeFromFavourites,
				removeFromPlaylist,
				favourites,
				addToPlaylist,
			}}>
			{children}
		</PlaylistContext.Provider>
	);
}

export function usePlaylist() {
	const context = useContext(PlaylistContext);
	if (context === undefined) {
		throw new Error('usePlaylist must be used within a PlaylistProvider');
	}
	return context;
}
