export interface SimplifiedTrack {
	id: string;
	images: {
		url: string;
		width: number;
		height: number;
	}[];
	name: string;
	artists: {
		id: string;
		name: string;
	}[];
	album: {
		id: string;
		name: string;
	};
	duration: number;
}
