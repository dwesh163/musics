'use client';
import { ScrollArea } from './ui/scroll-area';
import { SimplifiedTrack } from '@/types/track';
import { TrackItem } from './track-item';

export function History({ history }: { history: SimplifiedTrack[] }) {
	return (
		<ScrollArea className="w-full h-[calc(100%-6rem)]">
			<div className="space-y-2">
				{history.map((track, index) => (
					<TrackItem key={track.id + index} track={track} index={index} config={{ index: true, image: true, name: true, artists: true, album: true, play: true }} />
				))}
			</div>
		</ScrollArea>
	);
}
