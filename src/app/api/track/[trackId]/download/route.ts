import { checkAccreditation, getUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { downloadTrack } from '@/lib/track';
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
	interval: 60 * 1000,
	uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest, context: any) {
	try {
		const { trackId } = await context.params;

		const user = await getUser();

		if (!user) {
			return NextResponse.json({ message: 'Not authenticated.' }, { status: 401 });
		}

		if (!(await checkAccreditation('musics:download'))) {
			return NextResponse.json({ message: 'Not authorized.' }, { status: 403 });
		}

		const { isRateLimited } = limiter.check(10, `song_${user.email}`);
		if (isRateLimited) {
			return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
		}

		await downloadTrack(trackId);

		return NextResponse.json({ message: `Track downloaded` });
	} catch (error) {
		console.error('Track download failed:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
