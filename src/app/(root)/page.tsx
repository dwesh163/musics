import { getUser } from '@/lib/auth';
import { Header } from '@/components/header';
import FeaturedContent from '@/components/featured-content';
import PlaylistTabs from '@/components/playlist-tabs';

export default async function HomePage() {
	const user = await getUser();
	return (
		<div className="px-6">
			<Header />
			<FeaturedContent />
			<PlaylistTabs />
		</div>
	);
}
