import { getUser } from '@/lib/auth';
import { createPlaylist } from '@/lib/playlist';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const user = await getUser();
		if (!user) return NextResponse.json({ message: 'Unauthorized', status: 401 });

		const { name } = await req.json();

		const playlist = await createPlaylist(name, user.id);
		return NextResponse.json(playlist);
	} catch (error) {
		console.error('Failed to create playlist:', error);
		return NextResponse.json({ message: 'Internal server error', status: 500 });
	}
}
