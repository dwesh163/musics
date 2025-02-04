import { LogModel } from '@/models/Log';
import { getSpotifyApi } from './api';
import { getUser } from './auth';
import { RightSidebarType } from '@/types/sidebar';
import { UserModel } from '@/models/User';

export async function getRightSidebarData(): Promise<RightSidebarType | null> {
	try {
		const user = await getUser();
		if (!user) {
			return null;
		}

		const api = await getSpotifyApi();
		const newReleases = await api.browse.getNewReleases();
		const userData = await UserModel.findOne({ email: user.email });

		if (!userData) {
			throw new Error('User not found in database');
		}

		const listenMoreOften = await LogModel.aggregate([
			{
				$match: {
					userId: userData._id,
					type: 'listen',
				},
			},
			{
				$group: {
					_id: '$trackId',
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$lookup: {
					from: 'tracks',
					localField: '_id',
					foreignField: '_id',
					as: 'track',
				},
			},
			{
				$unwind: '$track',
			},
			{
				$lookup: {
					from: 'artists',
					localField: 'track.artistsId',
					foreignField: '_id',
					as: 'artists',
				},
			},
			{
				$lookup: {
					from: 'albums',
					localField: 'track.albumId',
					foreignField: '_id',
					as: 'album',
				},
			},
			{
				$unwind: '$album',
			},
			{
				$project: {
					_id: 0,
					id: '$track.id',
					name: '$track.name',
					artists: {
						$map: {
							input: '$artists',
							as: 'artist',
							in: {
								id: '$$artist.id',
								name: '$$artist.name',
							},
						},
					},
					images: '$track.images',
					album: {
						id: '$album.id',
						name: '$album.name',
					},
				},
			},
			{
				$limit: 4,
			},
		]);

		const favouriteArtists = await LogModel.aggregate([
			{
				$match: {
					userId: userData._id,
					type: 'listen',
				},
			},
			{
				$lookup: {
					from: 'tracks',
					localField: 'trackId',
					foreignField: '_id',
					as: 'track',
				},
			},
			{
				$unwind: '$track',
			},
			{
				$unwind: '$track.artistsId',
			},
			{
				$lookup: {
					from: 'artists',
					localField: 'track.artistsId',
					foreignField: '_id',
					as: 'artist',
				},
			},
			{
				$unwind: '$artist',
			},
			{
				$group: {
					_id: '$artist._id',
					id: { $first: '$artist.id' },
					name: { $first: '$artist.name' },
					imageUrl: { $first: '$artist.imageUrl' },
					subscribers: { $first: '$artist.subscribers' },
					listens: { $sum: 1 },
				},
			},
			{
				$sort: { listens: -1 },
			},
			{
				$project: {
					_id: 0,
					id: 1,
					name: 1,
					imageUrl: 1,
					subscribers: 1,
				},
			},
			{
				$limit: 5,
			},
		]);

		return {
			newReleases,
			listenMoreOften,
			favouriteArtists: favouriteArtists.map((artist) => ({
				...artist,
				images: [{ url: artist.imageUrl }],
				followers: {
					total: artist.subscribers.toLocaleString(),
				},
			})),
		};
	} catch (error) {
		console.error('Failed to get right sidebar data:', error);
		return null;
	}
}
