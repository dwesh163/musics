import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
export const dynamic = 'auto';
import '@/app/globals.css';
import { SessionProvider } from '@/components/session-provider';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Musics',
	description: 'A simple musics app',
	keywords: ['musics', 'songs', 'albums', 'artists'],
	applicationName: 'Kooked Musics',
	manifest: '/manifest.json',
};

type RootLayoutProps = any;

export default function RootLayout(props: RootLayoutProps) {
	const { children, session } = props;
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<SessionProvider session={session}>{children}</SessionProvider>
			</body>
		</html>
	);
}
