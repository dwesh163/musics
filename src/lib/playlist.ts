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

		const playlist = await PlaylistModel.findOne<IPlaylist>({
			id: playlistId,
			userId: user.id,
		});

		if (!playlist) return null;

		const trackIds = playlist.tracks.map((t) => t.id);

		const tracksData = await TrackModel.aggregate([
			{
				$match: {
					_id: { $in: trackIds },
				},
			},
			{
				$lookup: {
					from: 'artists',
					localField: 'artistsId',
					foreignField: '_id',
					as: 'artists',
				},
			},
			{
				$lookup: {
					from: 'albums',
					localField: 'albumId',
					foreignField: '_id',
					as: 'album',
				},
			},
			{
				$unwind: '$album',
			},
		]).exec();

		const trackAddedDates = new Map(playlist.tracks.map((t) => [t.id.toString(), t.addedAt]));

		const tracks = tracksData.map((track) => ({
			id: track.id,
			name: track.name,
			artists: track.artists.map((artist: IArtist) => ({
				id: artist.id,
				name: artist.name,
			})),
			album: {
				id: track.album.id,
				name: track.album.name,
				image: track.album.imageUrl,
			},
			duration: track.duration,
			images: track.images.map((image: { url: string; width: number; height: number }) => ({
				url: image.url,
				width: image.width,
				height: image.height,
			})),
			addedAt: trackAddedDates.get(track._id.toString())!,
		}));

		const trackCount = tracks.length;
		const images =
			trackCount >= 4
				? [0.2, 0.4, 0.6, 0.8]
						.map((fraction) => Math.floor(trackCount * fraction))
						.filter((index) => index < trackCount)
						.map((index) => tracks[index]?.images?.[0]?.url)
						.filter(Boolean)
				: tracks.map((track) => track.images[0]?.url).filter(Boolean);

		return {
			id: playlist.id,
			name: playlist.name,
			length: trackCount,
			createAt: playlist.createAt,
			images,
			tracks,
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

		const playlists = await PlaylistModel.find({ userId: user.id }).populate<{ tracks: { id: ITrack }[] }>('tracks.id').exec();

		return playlists
			.filter((playlist) => user.favouritePlaylist?.toString() !== playlist._id.toString())
			.map((playlist) => {
				const populatedTracks = playlist.tracks.map((track) => track.id);
				const trackCount = populatedTracks.length;
				const imageIndices = [0.2, 0.4, 0.6, 0.8].map((fraction) => Math.floor(trackCount * fraction)).filter((index) => index < trackCount);

				return {
					id: playlist.id,
					name: playlist.name,
					length: trackCount,
					duration: populatedTracks.reduce((acc, track) => acc + track.duration, 0),
					createAt: playlist.createAt,
					images: trackCount >= 4 ? imageIndices.map((index) => populatedTracks[index]?.images?.[0]?.url).filter(Boolean) : populatedTracks.map((track) => track.images?.[0]?.url).filter(Boolean),
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

		const playlist = await PlaylistModel.findOne<IPlaylist>({ id: playlistId });
		if (!playlist) return { message: 'Playlist not found', status: 404 };

		if (playlist.tracks.find((t) => t.id.toString() === track._id.toString())) {
			return { message: 'Track already exists in the playlist', status: 200 };
		}

		await PlaylistModel.updateOne(
			{ id: playlistId },
			{
				$addToSet: {
					tracks: {
						id: track._id,
						addedAt: new Date(),
					},
				},
			}
		);

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
		const playlist = await PlaylistModel.findOne<IPlaylist>({ id: playlistId });
		if (!playlist) return { message: 'Playlist not found', status: 404 };

		const track = await TrackModel.findOne({ id: trackId });
		if (!track) return { message: 'Track not found', status: 404 };

		if (!playlist.tracks.find((t) => t.id.toString() === track._id.toString())) {
			return { message: 'Track not found in the playlist', status: 404 };
		}

		await PlaylistModel.updateOne({ id: playlistId }, { $pull: { tracks: { id: track._id } } });

		return { message: 'Track removed from playlist successfully', status: 200 };
	} catch (error) {
		console.error('Failed to remove a track from the playlist:', error);
		return {
			message: 'Internal server error',
			status: 500,
		};
	}
}
