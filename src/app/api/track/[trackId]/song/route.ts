import { checkAccreditation, getUser } from '@/lib/auth';
import { logTrackListen } from '@/lib/log';
import rateLimit from '@/lib/rate-limit';
import { getTrackFile } from '@/lib/track';
import { NextRequest, NextResponse } from 'next/server';

const limiter = rateLimit({
	interval: 60 * 1000,
	uniqueTokenPerInterval: 500,
});

export async function GET(req: NextRequest, context: any) {
	try {
		const { trackId } = await context.params;

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('musics:play'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const { isRateLimited } = limiter.check(30, `song_${user.email}`);
		if (isRateLimited) {
			return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
		}

		const url = new URL(req.url);
		const skipLog = url.searchParams.has('check');
		const songBuffer = await getTrackFile(trackId);

		if (!songBuffer) {
			return NextResponse.json({ message: 'Track not found.' }, { status: 404 });
		}

		if (!skipLog) {
			await logTrackListen(trackId);
		}

		const response = new NextResponse(songBuffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Content-Disposition': `inline; filename="track-${trackId}.mp3"`,
			},
		});

		return response;
	} catch (error) {
		console.error('Track download failed:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
