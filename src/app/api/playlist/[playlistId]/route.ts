import { checkAccreditation, getUser } from '@/lib/auth';
import { addTrackToPlaylist, removeTrackFromPlaylist } from '@/lib/playlist';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, context: any) {
	try {
		const { playlistId } = await context.params;
		const { trackId } = await req.json();

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('app:access'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const playlist = await addTrackToPlaylist(playlistId, trackId);
		return NextResponse.json({ message: playlist.message }, { status: playlist.status });
	} catch (error) {
		console.error('Failed to add track to playlist:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, context: any) {
	try {
		const { playlistId } = await context.params;
		const { trackId } = await req.json();

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('app:access'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const playlist = await removeTrackFromPlaylist(playlistId, trackId);
		return NextResponse.json({ message: playlist.message }, { status: playlist.status });
	} catch (error) {
		console.error('Failed to remove track from playlist:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
