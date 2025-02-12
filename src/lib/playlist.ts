import { ITrack, TrackModel } from '@/models/Track';
import { ErrorType } from '@/types/error';
import { saveTrackMetadata } from './track';
import { IPlaylist, PlaylistModel } from '@/models/Playlist';
import { getUser } from './auth';
import { v4 as uuid } from 'uuid';
import { PlaylistsType, PlaylistType } from '@/types/playlist';
import { IArtist } from '@/models/Artist';

export async function createPlaylist(name: string, userId: string): Promise<ErrorType> {
	try {
		const id = uuid().replace(/-/g, '');
		await PlaylistModel.create({ name, userId, tracks: [], id });
		return { message: 'Playlist created successfully', status: 200, data: { id } };
	} catch (error) {
		console.error('Failed to create a playlist:', error);
		return {
			message: 'Internal server error',
			status: 500,
		};
	}
}

export async function deletePlaylist(playlistId: string): Promise<ErrorType> {
	try {
		const playlist = await PlaylistModel.findOne({ id: playlistId });
		if (!playlist) return { message: 'Playlist not found', status: 404 };

		await PlaylistModel.deleteOne({ id: playlistId });

		return { message: 'Playlist deleted successfully', status: 200 };
	} catch (error) {
		console.error('Failed to delete a playlist:', error);
		return {
			message: 'Internal server error',
			status: 500,
		};
	}
}

export async function getFavouritePlaylist(): Promise<PlaylistType | null> {
	try {
		const user = await getUser();
		if (!user) return null;

		const playlist = await PlaylistModel.findOne({ _id: user.favouritePlaylist });
		if (!playlist) return null;

		return await getPlaylist(playlist.id);
	} catch (error) {
		console.error('Failed to get favourite playlist:', error);
		return null;
	}
}

export async function getPlaylist(playlistId: string): Promise<PlaylistType | null> {
	try {
		const user = await getUser();
		if (!user) return null;

		const playlist = await PlaylistModel.findOne({ id: playlistId, userId: user.id }).populate({
			path: 'tracks',
			populate: [{ path: 'artistsId' }, { path: 'albumId' }],
		});
		if (!playlist) return null;

		const trackCount = playlist.tracks.length;
		const imageIndices = [0.2, 0.4, 0.6, 0.8].map((fraction) => Math.floor(trackCount * fraction)).filter((index) => index < trackCount);

		return {
			id: playlist.id,
			name: playlist.name,
			length: trackCount,
			createAt: playlist.createAt,
			images: trackCount >= 4 ? imageIndices.map((index) => playlist.tracks[index]?.images?.[0]?.url).filter(Boolean) : playlist.tracks.map((track: ITrack) => track.images[0]?.url),
			tracks: playlist.tracks.map((track: any) => ({
				id: track.id,
				name: track.name,
				artists: track.artistsId.map((artist: IArtist) => ({
					id: artist.id,
					name: artist.name,
				})),
				album: {
					id: track.albumId.id,
					name: track.albumId.name,
					image: track.albumId.imageUrl,
				},
				duration: track.duration,
				images: track.images.map((image: any) => ({
					url: image.url,
					width: image.width,
					height: image.height,
				})),
			})),
		};
	} catch (error) {
		console.error('Failed to get a playlist:', error);
		return null;
	}
}

export async function getPlaylists(): Promise<PlaylistsType[] | null> {
	try {
		const user = await getUser();
		if (!user) return null;

		const playlists = await PlaylistModel.find<IPlaylist>({ userId: user.id }).populate<{ tracks: ITrack[] }>('tracks').exec();

		return playlists
			.filter((playlist) => user.favouritePlaylist.toString() != playlist._id.toString())
			.map((playlist) => {
				const trackCount = playlist.tracks.length;
				const imageIndices = [0.2, 0.4, 0.6, 0.8].map((fraction) => Math.floor(trackCount * fraction)).filter((index) => index < trackCount);
				return {
					id: playlist.id,
					name: playlist.name,
					length: trackCount,
					duration: playlist.tracks.reduce((acc, track) => acc + track.duration, 0),
					createAt: playlist.createAt,
					images: trackCount >= 4 ? imageIndices.map((index) => playlist.tracks[index]?.images?.[0]?.url).filter(Boolean) : playlist.tracks.map((track) => track.images[0]?.url),
				};
			});
	} catch (error) {
		console.error('Failed to get playlists:', error);
		return null;
	}
}

export async function addTrackToPlaylist(playlistId: string, trackId: string): Promise<ErrorType> {
	try {
		let track: ITrack | null = await TrackModel.findOne({ id: trackId });

		if (!track) {
			const save = await saveTrackMetadata(trackId);
			if (save.status !== 200) return save;
			track = await TrackModel.findOne({ id: trackId });
			if (!track) return { message: 'Failed to retrieve track metadata', status: 500 };
		}

		const playlist = await PlaylistModel.findOne({ id: playlistId });
		if (!playlist) return { message: 'Playlist not found', status: 404 };

		if (playlist.tracks.includes(track._id)) {
			return { message: 'Track already exists in the playlist', status: 200 };
		}

		await PlaylistModel.updateOne({ id: playlistId }, { $addToSet: { tracks: track._id } });

		return { message: 'Track added to playlist successfully', status: 200 };
	} catch (error) {
		console.error('Failed to add a track to the playlist:', error);
		return {
			message: 'Internal server error',
			status: 500,
		};
	}
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<ErrorType> {
	try {
		const playlist = await PlaylistModel.findOne({ id: playlistId });
		if (!playlist) return { message: 'Playlist not found', status: 404 };

		const track = await TrackModel.findOne({ id: trackId });
		if (!track) return { message: 'Track not found', status: 404 };

		if (!playlist.tracks.includes(track._id)) {
			return { message: 'Track not found in the playlist', status: 404 };
		}

		await PlaylistModel.updateOne({ id: playlistId }, { $pull: { tracks: track._id } });

		return { message: 'Track removed from playlist successfully', status: 200 };
	} catch (error) {
		console.error('Failed to remove a track from the playlist:', error);
		return {
			message: 'Internal server error',
			status: 500,
		};
	}
}
