import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

type PlaylistDialogProps = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	trigger: React.ReactNode;
};

export const PlaylistDialog = ({ isOpen, onOpenChange, trigger }: PlaylistDialogProps) => {
	const playlists = [
		{ id: 1, name: 'Favorites' },
		{ id: 2, name: 'Workout Mix' },
		{ id: 3, name: 'Chill Vibes' },
	];

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Add to Playlist</DialogTitle>
				</DialogHeader>
				<ScrollArea className="h-[300px] px-1">
					{playlists.map((playlist) => (
						<Button key={playlist.id} variant="ghost" className="w-full justify-start text-left font-normal mb-1" onClick={() => onOpenChange(false)}>
							{playlist.name}
						</Button>
					))}
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};
