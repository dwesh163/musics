import { ReactNode } from 'react';
import React from 'react';
import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LeftSidebar from '@/components/left-sidebar';
import RightSidebar from '@/components/right-sidebar';
import PlayerBar from '@/components/player-bar';
import { PlaybackProvider } from '../playback-context';

export default async function RootLayout({ children }: { children: ReactNode }) {
	const user = await getUser();
	if (!user) redirect('/login');

	return (
		<React.Fragment>
			<PlaybackProvider>
				<div className="flex">
					<LeftSidebar user={user} />
					<main className="flex-1 h-[calc(100svh-6.5rem)]">{children}</main>
					<RightSidebar />
				</div>
				<PlayerBar />
			</PlaybackProvider>
		</React.Fragment>
	);
}
