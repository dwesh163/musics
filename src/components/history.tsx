'use client';
import { ScrollArea } from './ui/scroll-area';
import { SimplifiedTrack } from '@/types/track';
import { TrackItem } from './TrackItem';

export function History({ history }: { history: SimplifiedTrack[] }) {
	return (
		<ScrollArea className="w-full h-[calc(100%-5rem)]">
			<div className="space-y-2">
				{history.map((track, index) => (
					<TrackItem key={track.id + index} track={track} index={index} config={{ index: true, image: true, name: true, artists: true }} />
				))}
			</div>
		</ScrollArea>
	);
}
