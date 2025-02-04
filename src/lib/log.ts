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
