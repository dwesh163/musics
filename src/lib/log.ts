import { LogModel } from '@/models/Log';
import { getUser } from './auth';
import { TrackModel } from '@/models/Track';
import { SimplifiedTrack } from '@/types/track';
import { UserModel } from '@/models/User';

export async function logTrackListen(trackId: string) {
	try {
		const user = await getUser();
		if (!user) return;

		const track = await TrackModel.findOne({ id: trackId });
		if (!track) {
			console.warn(`Track with id ${trackId} not found.`);
			return;
		}

		await LogModel.create({
			userId: user.id,
			type: 'listen',
			trackId: track._id,
		});
	} catch (error) {
		console.error('Track listen failed:', error);
	}
}

export async function logTrackDownload(trackId: string) {
	try {
		const user = await getUser();
		if (!user) return;

		const track = await TrackModel.findOne({ id: trackId });
		if (!track) {
			console.warn(`Track with id ${trackId} not found.`);
			return;
		}

		await LogModel.create({
			userId: user.id,
			type: 'download',
			trackId: track._id,
		});
	} catch (error) {
		console.error('Track download failed:', error);
	}
}

export async function getHistory(): Promise<SimplifiedTrack[] | null> {
	try {
		const user = await getUser();
		if (!user) return null;

		const userData = await UserModel.findOne({ email: user.email });
		if (!userData) return null;

		const logs = await LogModel.aggregate([
			{ $match: { userId: userData._id, type: 'listen' } },
			{ $sort: { date: -1 } },
			{
				$lookup: {
					from: 'tracks',
					localField: 'trackId',
					foreignField: '_id',
					as: 'track',
				},
			},
			{ $unwind: '$track' },
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
			{ $unwind: { path: '$album', preserveNullAndEmptyArrays: true } },
			{
				$project: {
					_id: 0,
					id: '$track.id',
					name: '$track.name',
					images: {
						$map: {
							input: '$track.images',
							as: 'image',
							in: {
								url: '$$image.url',
								width: '$$image.width',
								height: '$$image.height',
							},
						},
					},
					duration: '$track.duration',
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
					album: {
						id: '$album.id',
						name: '$album.name',
					},
				},
			},
			{ $limit: 50 },
		]);

		return logs;
	} catch (error) {
		console.error('Get history failed:', error);
		return null;
	}
}
