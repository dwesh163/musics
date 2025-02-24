import NextAuth, { NextAuthOptions, User, Session } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { v4 as uuid } from 'uuid';
import db from '@/lib/mongo';
import { IUser, UserModel } from '@/models/User';
import { AccreditationModel, IAccreditation } from '@/models/Accreditation';
import { JWT } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { cookies } from 'next/headers';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryt from 'bcrypt';
import rateLimit from './rate-limit';
import { createPlaylist } from './playlist';
import { PlaylistModel } from '@/models/Playlist';

const limiter = rateLimit({
	interval: 60 * 1000,
	uniqueTokenPerInterval: 500,
});

const getProviders = () => [
	GitHubProvider({
		clientId: process.env.GITHUB_ID!,
		clientSecret: process.env.GITHUB_SECRET!,
	}),
	GoogleProvider({
		clientId: process.env.GOOGLE_ID!,
		clientSecret: process.env.GOOGLE_SECRET!,
	}),
	CredentialsProvider({
		name: 'Credentials',
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' },
		},
		async authorize(credentials, req) {
			try {
				if (!credentials) return null;

				const ip = req?.headers?.['x-forwarded-for'] || '127.0.0.1';
				const { isRateLimited } = limiter.check(5, `login_${ip}`);
				if (isRateLimited) {
					throw new Error('Too many login attempts. Please try again later.');
				}

				await db.connect();

				const user = await UserModel.findOne<IUser>({ email: credentials.email }, 'email password verified username name _id favouritePlaylist').lean();

				if (!user || !user.verified) {
					await new Promise((r) => setTimeout(r, 1000));
					return null;
				}

				const isValid = await bcryt.compare(credentials.password, user.password);
				if (!isValid) {
					await new Promise((r) => setTimeout(r, 1000));
					return null;
				}

				return {
					id: user.id,
					email: user.email,
					username: user.username,
					name: user.name,
					favouritePlaylist: user.favouritePlaylist,
				};
			} catch (error) {
				console.error('Auth error:', error);
				throw new Error('An error occurred');
			}
		},
	}),
];

export const enhanceToken = async ({ token, user }: { token: JWT; user: User }): Promise<JWT> => {
	try {
		const access = await checkAccreditation('app:access');

		return {
			...token,
			access,
		};
	} catch (error) {
		console.error('Token enhancement error:', error);
		return token;
	}
};

export const handleSignIn = async ({ user, account, profile }: { user: User; account: any; profile?: any }): Promise<boolean> => {
	try {
		await db.connect();
		const email = user.email;
		if (!email) return false;

		const provider = account?.provider ?? 'credentials';
		const defaultAccreditation = await AccreditationModel.findOne<IAccreditation>({ slug: 'den', accessLevel: 0 }).exec();
		if (!defaultAccreditation) return false;

		const existingUser = await UserModel.findOne({ email }).exec();
		const userData = {
			username: profile?.name ?? profile?.login ?? existingUser?.username ?? null,
			image: user.image ?? profile?.image ?? existingUser?.image ?? null,
			name: profile?.name ?? user.name ?? profile?.login ?? existingUser?.name ?? null,
			provider,
			verified: ['google', 'github'].includes(provider),
			accreditation: existingUser?.accreditation ?? defaultAccreditation._id,
		};

		const finalUser = existingUser ? await UserModel.findOneAndUpdate({ email }, userData, { new: true }) : await UserModel.create({ ...userData, email, id: uuid().replace(/-/g, '') });

		if (!existingUser) {
			const favourite = await createPlaylist('Favourites', finalUser._id.toString());
			const favouritePlaylist = await PlaylistModel.findOne({ id: favourite?.data?.id });
			if (favourite.status !== 200) throw new Error('Failed to create favourite playlist');
			await UserModel.updateOne({ _id: finalUser._id }, { favouritePlaylist: favouritePlaylist?._id });
		}

		return true;
	} catch (error) {
		console.error('Sign-in error:', error);
		return false;
	}
};
export const getUser = async (): Promise<User | null> => {
	const session = await getServerSession();

	const userCookies = await cookies();

	const token = userCookies.get(process.env.NEXTAUTH_COOKIE_NAME!);
	if (!token) return null;

	await db.connect();
	const user = await UserModel.findOne<IUser>({ email: session?.user?.email }).populate<{ accreditation: IAccreditation }>('accreditation', '-accessLevel').exec();
	if (!user) return null;

	if (!(await checkAccreditation('app:access'))) return null;

	return {
		email: session?.user?.email ?? '',
		name: user?.name ?? '',
		id: user?._id.toString() ?? '',
		username: user?.username ?? '',
		image: user?.image ?? '',
		favouritePlaylist: user?.favouritePlaylist.toString() ?? '',
	};
};

export const checkAccreditation = async (request: string): Promise<Boolean> => {
	const session = await getServerSession();
	if (!session) return false;

	await db.connect();
	const user = await UserModel.findOne<IUser>({ email: session?.user?.email }).populate<{ accreditation: IAccreditation }>('accreditation', '-slug -accessLevel').exec();
	if (!user) return false;

	const [access, action]: string[] = request.split(':');

	const { authorizations } = user.accreditation;
	if (authorizations && authorizations[access] && authorizations[access].includes(action)) {
		return true;
	}

	return false;
};

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: '/login',
		verifyRequest: '/login',
		error: '/login',
	},
	providers: getProviders(),
	session: {
		strategy: 'jwt',
		maxAge: 60 * 24 * 60 * 60, // 60 days
	},
	callbacks: {
		jwt: enhanceToken,
		signIn: handleSignIn,
	},
	events: {
		signIn: async ({ user, account }) => {
			await db.connect();
			await UserModel.updateOne({ email: user.email }, { lastLogin: new Date() });
		},
	},
};

export default NextAuth(authOptions);
