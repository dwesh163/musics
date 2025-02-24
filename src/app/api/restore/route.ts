import { NextResponse } from 'next/server';
import { IUser, UserModel } from '@/models/User';
import { PlaylistModel } from '@/models/Playlist';
import { TrackModel } from '@/models/Track';
import { saveTrackMetadata } from '@/lib/track';
import { v4 as uuid } from 'uuid';
import { getUser } from '@/lib/auth';
import { IAccreditation } from '@/models/Accreditation';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
	const user = await getUser();
	if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

	const accreditation = await UserModel.findOne<IUser>({ email: user.email }).populate<{ accreditation: IAccreditation }>('accreditation');
	if (!accreditation || accreditation.accreditation?.slug !== 'sadm') {
		return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();

		for (const userEmail of Object.keys(data.users)) {
			const userDB = await UserModel.findOne({ email: userEmail });
			if (!userDB) {
				console.log(`User not found: ${userEmail}`);
				continue;
			}

			const userPlaylists = data.users[userEmail].playlists;
			if (!userPlaylists) continue;

			if (userPlaylists.Liked) {
				const likedPlaylist = await PlaylistModel.findById(userDB.favouritePlaylist);
				if (!likedPlaylist) {
					console.log(`"Liked" playlist not found for ${userEmail}`);
					continue;
				}

				for (const trackData of userPlaylists.Liked) {
					const { id: trackId, addedAt } = trackData;
					let trackDB = await TrackModel.findOne({ id: trackId });

					if (!trackDB) {
						await saveTrackMetadata(trackId);
						trackDB = await TrackModel.findOne({ id: trackId });

						if (!trackDB) {
							console.warn(`Failed to fetch metadata for track: ${trackId}`);
							continue;
						}
					}

					const isTrackInPlaylist = await PlaylistModel.exists({ _id: likedPlaylist._id, tracks: trackDB._id });
					if (!isTrackInPlaylist) {
						await PlaylistModel.updateOne({ _id: likedPlaylist._id }, { $push: { tracks: { id: trackDB._id, addedAt } } });
						console.log(`Added to "Liked": ${trackId}`);
					} else {
						console.log(`Already in "Liked": ${trackId}`);
					}

					await wait(1000);
				}
			}

			for (const playlistName of Object.keys(userPlaylists)) {
				if (playlistName === 'Liked') continue;

				let playlistDB = await PlaylistModel.findOne({ name: playlistName, userId: userDB._id });

				if (!playlistDB) {
					playlistDB = await PlaylistModel.create({
						name: playlistName,
						userId: userDB._id,
						tracks: [],
						id: uuid().replace(/-/g, ''),
					});
					console.log(`Created playlist: ${playlistName}`);
				}

				for (const trackData of userPlaylists[playlistName]) {
					const { id: trackId, addedAt } = trackData;
					let trackDB = await TrackModel.findOne({ id: trackId });

					if (!trackDB) {
						await saveTrackMetadata(trackId);
						trackDB = await TrackModel.findOne({ id: trackId });

						if (!trackDB) {
							console.warn(`Failed to fetch metadata for track: ${trackId}`);
							continue;
						}
					}

					const isTrackInPlaylist = await PlaylistModel.exists({ _id: playlistDB._id, tracks: trackDB._id });
					if (!isTrackInPlaylist) {
						await PlaylistModel.updateOne({ _id: playlistDB._id }, { $push: { tracks: { id: trackDB._id, addedAt } } });
						console.log(`Added to "${playlistName}": ${trackId}`);
					} else {
						console.log(`Already in "${playlistName}": ${trackId}`);
					}

					await wait(1000);
				}
			}
		}

		return NextResponse.json({ message: 'Import completed' });
	} catch (error) {
		console.error('Error importing playlists:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
