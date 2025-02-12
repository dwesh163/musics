import { getToken, JWT } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
	try {
		const forwardedFor = req.headers.get('x-forwarded-for');
		const clientIp = forwardedFor || '127.0.0.1';
		const url = new URL(req.url);

		const sanitizeRedirectUrl = (path: string): string => {
			if (!path.startsWith('/')) return '/';

			const blockedPaths = ['/api', '/_next', '/error', '/denied', '/favicon.ico', '/image'];
			if (blockedPaths.some((blocked) => path.startsWith(blocked))) return '/';

			return path.replace(/[^\w\-\/\?\&\=]/g, '');
		};

		const createResponseWithHeaders = (response: NextResponse) => {
			response.headers.set('x-forwarded-for', clientIp);
			return response;
		};

		const token: JWT | null = await getToken({
			req,
			secret: process.env.NEXTAUTH_SECRET,
			cookieName: process.env.NEXTAUTH_COOKIE_NAME,
		});

		if (['/login', '/register'].some((path) => url.pathname.startsWith(path))) {
			return createResponseWithHeaders(NextResponse.next());
		}

		if (!token) {
			return createResponseWithHeaders(NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(sanitizeRedirectUrl(url.pathname))}`, req.url)));
		}

		if (token.exp && (token.exp as number) < Date.now() / 1000) {
			return createResponseWithHeaders(NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(sanitizeRedirectUrl(url.pathname))}`, req.url)));
		}

		if (!token.access) {
			return createResponseWithHeaders(NextResponse.redirect(new URL('/denied', req.url)));
		}

		return createResponseWithHeaders(NextResponse.next());
	} catch (error) {
		console.error('Middleware error', { error });
		return NextResponse.redirect(new URL('/error', req.url));
	}
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|error|denied|favicon.ico|image).*)'],
};
