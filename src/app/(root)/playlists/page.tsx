import { Error } from '@/components/error';
import { PlaylistsComponent } from '@/components/playlists';
import { getPlaylists } from '@/lib/playlist';
import { AlertCircle } from 'lucide-react';

export default async function PlaylistsPage() {
	const playlists = await getPlaylists();
	if (!playlists) {
		return (
			<div className="w-full h-full sm:px-6 px-3">
				<h1 className="sm:text-2xl text-xl sm:font-bold font-semibold sm:my-6 my-2">History</h1>
				<Error text="Something went wrong" subText="Failed to load playlists" Icon={AlertCircle} color="text-red-500" />;
			</div>
		);
	}

	return (
		<div className="w-full h-full sm:px-6 px-3">
			<h1 className="sm:text-2xl text-xl sm:font-bold font-semibold sm:my-6 my-2">Playlists</h1>
			<PlaylistsComponent playlists={playlists} />
		</div>
	);
}
