import { TrackModel } from '@/models/Track';
import { ErrorType } from '@/types/error';
import { getSpotifyApi } from './api';
import { logTrackDownload } from './log';
import { ArtistModel } from '@/models/Artist';
import { AlbumModel } from '@/models/Album';
import { getClientId } from './web-socket';
import { Track } from '@spotify/web-api-ts-sdk';

const API_HOST = process.env.API_HOST;
const API_ENDPOINT = `http://${API_HOST}/api`;

async function fetchDownloadUrl(trackId: string, clientId: string): Promise<string> {
	const spotifyUrl = `https://open.spotify.com/track/${trackId}`;
	const response = await fetch(`${API_ENDPOINT}/download/url?url=${encodeURIComponent(spotifyUrl)}&client_id=${clientId}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url: spotifyUrl, client_id: clientId }),
	});

	if (!response.ok) {
		const data = await response.json();
		console.error('Failed to fetch download URL:', data);
		throw new Error(data.detail || 'Failed to fetch download URL');
	}

	return await response.json();
}

async function saveTrackMetadata(trackId: string, downloadPath: string): Promise<void> {
	const api = await getSpotifyApi();
	const track: Track = await api.tracks.get(trackId);

	const artistList = await Promise.all(
		track.artists.map(async (artist) => {
			return await api.artists.get(artist.id);
		})
	);

	const artistObjectIds = await Promise.all(
		artistList.map(async (artist) => {
			const artistDoc = await ArtistModel.findOneAndUpdate(
				{ id: artist.id },
				{
					$setOnInsert: {
						id: artist.id,
						name: artist.name,
						imageUrl: artist.images[0]?.url,
						subscribers: artist.followers.total,
					},
				},
				{ upsert: true, new: true }
			);
			return artistDoc._id;
		})
	);

	const albumDoc = await AlbumModel.findOneAndUpdate(
		{ id: track.album.id },
		{
			$setOnInsert: {
				id: track.album.id,
				name: track.album.name,
				imageUrl: track.album.images[0]?.url,
			},
		},
		{ upsert: true, new: true }
	);

	await TrackModel.findOneAndUpdate(
		{ id: trackId },
		{
			$setOnInsert: {
				id: trackId,
				name: track.name,
				artistsId: artistObjectIds,
				albumId: albumDoc._id,
				images: track.album.images,
				duration: track.duration_ms / 1000,
				path: downloadPath,
			},
		},
		{ upsert: true }
	);
}

export async function downloadTrack(trackId: string): Promise<ErrorType> {
	try {
		const clientId = await getClientId();
		const downloadPath = await fetchDownloadUrl(trackId, clientId);

		await saveTrackMetadata(trackId, downloadPath);
		await logTrackDownload(trackId);

		return { message: 'Track downloaded successfully', status: 200 };
	} catch (error) {
		console.error('Track download failed:', error);
		return {
			message: error instanceof Error ? error.message : 'Internal server error',
			status: 500,
		};
	}
}

export async function getTrackFile(trackId: string): Promise<Blob | null> {
	try {
		const track = await TrackModel.findOne({ id: trackId });
		if (!track) return null;

		const clientId = await getClientId();
		const response = await fetch(`${API_ENDPOINT}/download/file?file=${encodeURIComponent(track.path)}&client_id=${clientId}`);

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.detail || 'File download failed');
		}

		return await response.blob();
	} catch (error) {
		console.error('Track file fetch failed:', error);
		throw error;
	}
}
