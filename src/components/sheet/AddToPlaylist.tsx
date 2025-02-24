import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music2 } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';
import { usePlaylist } from '@/app/playlists-context';
import { usePathname } from 'next/navigation';

export const AddToPlaylistSheet = ({ trackId, isOpen, setIsOpen }: { trackId: string; isOpen: boolean; setIsOpen: (isOpen: boolean) => void }) => {
	const { playlists, addToPlaylist } = usePlaylist();
	const pathname = usePathname();
	const playlistId = pathname?.startsWith('/playlist/') ? pathname.split('/')[2] : null;

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetContent className="p-6 px-4 mt-2 max-h-[70vh] overflow-y-auto [&>button]:hidden bg-card" side="bottom" onOpenAutoFocus={(e) => e.preventDefault()}>
				<SheetHeader>
					<SheetTitle></SheetTitle>
				</SheetHeader>
				<ScrollArea className="max-h-[70vh]">
					{playlists
						.filter((playlist) => playlist.id !== playlistId)
						.map(({ id, name, images, duration, length }, index) => (
							<div
								key={id}
								className={cn('w-full h-15 justify-start text-left', index < playlists.length - 1 && 'mb-2')}
								onClick={() => {
									addToPlaylist(id, trackId);
									setIsOpen(false);
								}}>
								<div className="flex items-center gap-3">
									{images.length > 0 ? (
										<div
											className={cn('relative flex-shrink-0 overflow-hidden rounded-[calc(var(--radius) * 1.5)] shadow-lg w-14 h-14 grid gap-0', {
												'grid-cols-1': images.length === 1,
												'grid-cols-2': images.length === 2 || images.length === 4,
												'grid-cols-2 grid-rows-2': images.length === 3,
											})}>
											{images.slice(0, 4).map((image, index) => (
												<img
													key={index}
													src={image}
													alt={name}
													width={50}
													height={50}
													className={cn('object-cover', {
														'w-full h-full': images.length !== 3,
														'col-span-2 row-span-1': images.length === 3 && index === 0,
														'col-span-1 row-span-1': images.length === 3 && index > 0,
													})}
												/>
											))}
										</div>
									) : (
										<div className="w-14 h-14 bg-zinc-800 rounded-[calc(var(--radius) * 1.5)] flex items-center justify-center">
											<Music2 className="w-1/3 h-1/3 text-zinc-600" />
										</div>
									)}
									<div className="text-left flex-1 min-w-0">
										<h1 className="font-semibold -mb-0.5 sm:mn-0 text-base truncate max-w-[50vw]">{name}</h1>
										<p className="text-sm text-gray-400 truncate max-w-[50vw]">
											{length} tracks • {moment.utc(duration * 1000).format('HH:mm:ss')}
										</p>
									</div>
								</div>
							</div>
						))}
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
};
