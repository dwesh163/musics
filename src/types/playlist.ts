import { SimplifiedTrack } from './track';

export type PlaylistsType = {
	id: string;
	name: string;
	createAt: Date;
	length: number;
	duration: number;
	images: string[];
	custom?: boolean;
};

export type PlaylistType = {
	id: string;
	name: string;
	images: string[];
	length: number;
	tracks: SimplifiedTrack[];
	createAt: Date;
};
