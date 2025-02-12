import { PlaylistsType } from '@/types/playlist';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import moment from 'moment';
import Link from 'next/link';
import { PlayCircle, Clock, Music2 } from 'lucide-react';

export function PlaylistsComponent({ playlists }: { playlists: PlaylistsType[] }) {
	return (
		<ScrollArea className="w-full h-[calc(100%-6rem)]">
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{playlists.map(({ id, name, images, duration, length }) => (
					<Link key={id} href={`/playlist/${id}`} className="group relative bg-zinc-900/50 hover:bg-zinc-800/50 rounded-xl transition-all duration-300 overflow-hidden">
						<div className="p-4 flex flex-col gap-4">
							<div className="relative aspect-square w-full">
								{images.length > 0 ? (
									<div
										className={cn('w-full h-full overflow-hidden rounded-lg shadow-xl', {
											'grid gap-1': images.length > 1,
											'grid-cols-1': images.length === 1,
											'grid-cols-2': images.length === 2 || images.length === 4,
											'grid-cols-2 grid-rows-2': images.length === 3,
										})}>
										{images.slice(0, 4).map((image, index) => (
											<Image
												key={index}
												src={image}
												alt={`${name} - image ${index + 1}`}
												width={200}
												height={200}
												className={cn('object-cover w-full h-full', {
													'col-span-2 row-span-1': images.length === 3 && index === 0,
													'col-span-1 row-span-1': images.length === 3 && index > 0,
												})}
											/>
										))}
									</div>
								) : (
									<div className="w-full h-full bg-zinc-800 rounded-lg flex items-center justify-center">
										<Music2 className="w-1/3 h-1/3 text-zinc-600" />
									</div>
								)}

								<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
									<PlayCircle className="w-16 h-16 text-white opacity-80 hover:opacity-100 hover:scale-105 transition-all" />
								</div>
							</div>

							<div className="space-y-2">
								<h2 className="font-bold sm:text-lg text-base text-white line-clamp-1 group-hover:text-orange-500 transition-colors">{name}</h2>

								<div className="flex items-center gap-3 sm:text-sm text-xs text-zinc-400">
									<div className="flex items-center gap-1">
										<Music2 size={14} />
										<span>{length} tracks</span>
									</div>
									<div className="flex items-center gap-1">
										<Clock size={14} />
										<span>{moment.utc(duration * 1000).format('HH:mm:ss')}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
					</Link>
				))}
			</div>
		</ScrollArea>
	);
}
