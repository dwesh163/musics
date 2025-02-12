import { getUser } from '@/lib/auth';
import { getPlaylists } from '@/lib/playlist';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const user = await getUser();
		if (!user) return NextResponse.json({ message: 'Unauthorized', status: 401 });

		const playlists = await getPlaylists();
		if (!playlists) return NextResponse.json({ message: 'Internal server error', status: 500 });

		return NextResponse.json(playlists);
	} catch (error) {
		console.error('Failed to get playlists:', error);
		return NextResponse.json({ message: 'Internal server error', status: 500 });
	}
}
