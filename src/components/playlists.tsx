import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayCircle, Clock, Music2 } from 'lucide-react';
import Link from 'next/link';
import moment from 'moment';
import { cn } from '@/lib/utils';
import { PlaylistsType } from '@/types/playlist';

export function PlaylistsComponent({ playlists }: { playlists: PlaylistsType[] }) {
	return (
		<ScrollArea className="w-full mt-4 sm:mt-0 sm:h-full h-[calc(100svh-10rem)]">
			<div className="p-2 px-2">
				<div className="flex flex-col gap-3 md:hidden">
					{playlists.map(({ id, name, images, duration, length, custom }) => (
						<Link key={id} href={`/${!custom ? 'playlist/' : ''}${id}`} className="flex">
							<div className="flex flex-1 gap-3">
								<div className="relative w-20 h-20 flex-shrink-0">
									{images.length > 0 ? (
										<div
											className={cn('relative h-full w-full overflow-hidden rounded-lg shadow-lg grid gap-0', {
												'grid-cols-1': images.length === 1,
												'grid-cols-2': images.length === 2 || images.length === 4,
												'grid-cols-2 grid-rows-2': images.length === 3,
											})}>
											{images.slice(0, 4).map((image, index) => (
												<img
													key={index}
													src={image}
													alt={'Image ' + (index + 1)}
													width={200}
													height={200}
													className={cn('object-cover', {
														'w-full h-full': images.length !== 3,
														'col-span-2 row-span-1': images.length === 3 && index === 0,
														'col-span-1 row-span-1': images.length === 3 && index > 0,
													})}
												/>
											))}
										</div>
									) : (
										<div className="h-full w-full bg-zinc-800/30 rounded-lg flex items-center justify-center">
											<Music2 className="w-8 h-8 text-zinc-400" />
										</div>
									)}
									<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
										<PlayCircle className="w-8 h-8 text-white" />
									</div>
								</div>

								<div className="flex flex-col mt-1 flex-1 pb-2 min-w-0">
									<h3 className="font-semibold text-lg text-white/90 group-hover:text-white transition-colors truncate">{name}</h3>
									<span className="text-zinc-400">
										{length} tracks · {moment.utc(duration * 1000).format('HH:mm:ss')}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>

				<div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
					{playlists.map(({ id, name, images, duration, length }) => (
						<Link key={id} href={`/playlist/${id}`} className="group flex flex-col bg-zinc-900/20 hover:bg-zinc-800/30 rounded-lg transition-all duration-300">
							<div className="p-4 flex flex-col gap-4">
								<div className="relative aspect-square w-full">
									{images.length > 0 ? (
										<div
											className={cn('relative overflow-hidden rounded-lg shadow-lg w-full h-full grid gap-0', {
												'grid-cols-1': images.length === 1,
												'grid-cols-2': images.length === 2 || images.length === 4,
												'grid-cols-2 grid-rows-2': images.length === 3,
											})}>
											{images.slice(0, 4).map((image, index) => (
												<img
													key={index}
													src={image}
													alt={'Image ' + (index + 1)}
													width={200}
													height={200}
													className={cn('object-cover', {
														'w-full h-full': images.length !== 3,
														'col-span-2 row-span-1': images.length === 3 && index === 0,
														'col-span-1 row-span-1': images.length === 3 && index > 0,
													})}
												/>
											))}
										</div>
									) : (
										<div className="w-full h-full bg-zinc-800/30 rounded-lg flex items-center justify-center">
											<Music2 className="w-12 h-12 text-zinc-400" />
										</div>
									)}
									<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
										<PlayCircle className="w-12 h-12 text-white" />
									</div>
								</div>

								<div className="flex flex-col gap-1">
									<h3 className="font-medium text-white/90 group-hover:text-white transition-colors">{name}</h3>
									<div className="flex items-center gap-4 text-sm text-zinc-400">
										<div className="flex items-center gap-1">
											<Music2 className="w-4 mt-0.5 h-4" />
											<span>{length} tracks</span>
										</div>
										<div className="flex items-center gap-1">
											<Clock className="w-4 mt-0.5 h-4" />
											<span>{moment.utc(duration * 1000).format('HH:mm:ss')}</span>
										</div>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</ScrollArea>
	);
}
