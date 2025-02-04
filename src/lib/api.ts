import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SPOTIFY_ID = process.env.SPOTIFY_ID!;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET!;

let api = SpotifyApi.withClientCredentials(SPOTIFY_ID, SPOTIFY_SECRET);
let tokenExpiration = Date.now() + 3600 * 1000;

const refreshTokenIfNeeded = async () => {
	if (Date.now() < tokenExpiration) return;

	console.info('Refreshing Spotify token...');

	api = SpotifyApi.withClientCredentials(SPOTIFY_ID, SPOTIFY_SECRET);
	tokenExpiration = Date.now() + 3600 * 1000;
};

export const getSpotifyApi = async () => {
	await refreshTokenIfNeeded();
	return api;
};
