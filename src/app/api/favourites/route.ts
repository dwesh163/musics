import { checkAccreditation, getUser } from '@/lib/auth';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '@/lib/playlist';
import { IPlaylist, PlaylistModel } from '@/models/Playlist';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const { trackId } = await req.json();

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('app:access'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const favouritePlaylist = await PlaylistModel.findOne<IPlaylist>({ _id: user.favouritePlaylist });
		if (!favouritePlaylist) {
			return NextResponse.json({ message: 'Favourite playlist not found' }, { status: 404 });
		}

		const playlist = await addTrackToPlaylist(favouritePlaylist.id, trackId);
		return NextResponse.json({ message: playlist.message }, { status: playlist.status });
	} catch (error) {
		console.error('Failed to add track to favourite:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { trackId } = await req.json();

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('app:access'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const favouritePlaylist = await PlaylistModel.findOne<IPlaylist>({ _id: user.favouritePlaylist });
		if (!favouritePlaylist) {
			return NextResponse.json({ message: 'Favourite playlist not found' }, { status: 404 });
		}

		const playlist = await removeTrackFromPlaylist(favouritePlaylist.id, trackId);
		return NextResponse.json({ message: playlist.message }, { status: playlist.status });
	} catch (error) {
		console.error('Failed to remove track from favourite:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
