import { NewReleases, Artist } from '@spotify/web-api-ts-sdk';
import { SimplifiedTrack } from './track';

export interface RightSidebarType {
	listenMoreOften: SimplifiedTrack[];
	favouriteArtists: Artist[];
	newReleases: NewReleases;
}
