import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '../ui/input';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';

export const CreatePlaylistDialog = () => {
	const [playlistName, setPlaylistName] = useState('');
	const [error, setError] = useState('');
	const [isOpen, setIsOpen] = useState(false);

	const router = useRouter();

	const handleCreate = async () => {
		if (!playlistName.trim()) {
			setError('Playlist name is required');
			return;
		}
		if (playlistName.length < 3) {
			setError('Playlist name must be at least 3 characters long');
			return;
		}

		try {
			const response = await fetch('/api/playlist', {
				method: 'POST',
				body: JSON.stringify({ name: playlistName }),
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				try {
					const data = await response.json();
					console.error('Failed to create playlist:', data);
					setError(data.message || 'Internal server error');
				} catch (error) {
					console.error('Failed to create playlist:', error);
					setError('Internal server error');
				}
			}

			const playlist = await response.json();
			console.log('Playlist created:', playlist);
			setPlaylistName('');
			setError('');
			router.refresh();
			setIsOpen(false);
		} catch (error) {
			console.error('Failed to create playlist:', error);
			setError('Internal server error');
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button className="w-full mt-4 justify-center hover:no-underline font-normal transition-colors">
					<Plus size={20} />
					Create new playlist
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create new playlist</DialogTitle>
					<DialogDescription>Give your playlist a name</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Input
						placeholder="Playlist name"
						value={playlistName}
						onChange={(e) => {
							setPlaylistName(e.target.value);
							setError('');
						}}
					/>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<Button className="bg-orange-500 hover:bg-orange-400" onClick={handleCreate}>
						Create
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
