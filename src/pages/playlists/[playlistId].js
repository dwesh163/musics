import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Player from '@/components/player';
import Menu from '@/components/menu';
import { useRouter } from 'next/router';
import Loading from '@/components/loading';
import packageJson from '/package.json';

export default function Home() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [playlist, setPlaylist] = useState({});
	const [isStarted, setIsStarted] = useState(false);

	const [isOpen, setIsOpen] = useState(false);
	const [error, setError] = useState('');

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		if (!router.query.playlistId) {
			return;
		}
		const fetchData = async () => {
			try {
				const response = await fetch('/api/playlist/' + router.query.playlistId);
				const playlistData = await response.json();
				setPlaylist(playlistData);
				if (!playlistData.error) {
				} else {
					setError(playlistData.error);
				}
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching audio data:', error);
			}
		};

		fetchData();
	}, [router.query.playlistId]);

	if (status == 'loading' || status == 'unauthenticated' || isLoading || error != '') {
		return <Loading status={isLoading ? 'loading' : error != '' ? 'error' : status} error={error} />;
	}

	if (packageJson && packageJson.version && packageJson.version != session.user.version) {
		router.push('/auth/signin?callbackUrl=' + router.asPath);
	}

	return (
		<>
			<Head>
				<title>{playlist.playlist.name}</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="w-full h-full overflow-hidden bg-[#171719]">
				<div className="w-full h-full flex overflow-hidden bg-[#171719]">
					<Player isStarted={isStarted} setIsStarted={setIsStarted} />
					<Menu isOpen={isOpen} setIsOpen={setIsOpen} />
					<div className=" relative flex overflow-hidden bg-[#171719] w-full h-full">
						{playlist.error ? (
							<div className="h-[calc(100vh-101px)] w-full flex items-center justify-center text-white">Playlist not Found</div>
						) : (
							<div className="w-full h-full overflow-hidden">
								<div className="w-full p-5 pl-4 sm:p-7 pb-0 sm:pb-0 flex justify-between">
									<div>
										<h1 className="text-3xl mb-0 font-extrabold leading-none tracking-tight md:text-4xl lg:text-6xl text-white">{playlist.playlist.name}</h1>
										<p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
											{playlist.tracks.length} Track{playlist.tracks.length > 1 ? 's' : ''}
										</p>
									</div>

									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleMenu} className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer sm:hidden" preserveAspectRatio="none">
										<path d="M6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
										<path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
										<path d="M19.5 12C19.5 12.5523 19.0523 13 18.5 13C17.9477 13 17.5 12.5523 17.5 12C17.5 11.4477 17.9477 11 18.5 11C19.0523 11 19.5 11.4477 19.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
									</svg>
								</div>

								<div className="sm:px-7 px-4 overflow-y-scroll overflow-x-hidden h-[calc(100vh-250px)]">
									<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
										<thead className="text-xs text-gray-900 uppercase dark:text-gray-400 w-full">
											<tr>
												<th scope="col" className="px-3 py-1 text-center">
													#
												</th>
												<th scope="col" className="px-0 py-3">
													Track
												</th>
												<th scope="col" className="hidden md:table-cell px-6 py-3">
													Album
												</th>
												<th scope="col" className="hidden md:table-cell px-6 py-3">
													Date
												</th>
												<th scope="col" className="hidden md:table-cell px-6 py-3">
													Duration
												</th>
											</tr>
										</thead>
										<tbody className="">
											{playlist.tracks.map((track, index) => (
												<tr key={index + '-track'} className="bg-[#11111170] hover:bg-[#1d1d1d70] group">
													<td className="relative">
														<div
															className="text-center flex items-center justify-center group-hover:text-transparent group-hover:cursor-pointer"
															onClick={() => {
																const trackIds = playlist.tracks.map((track) => track.track_public_id);

																localStorage.setItem(
																	'songData',
																	JSON.stringify({
																		status: 'play',
																		songId: track.track_public_id,
																		playlist: {
																			name: playlist.playlist.name,
																			list: trackIds,
																			currentIndex: index,
																		},
																	})
																);
																setIsStarted(true);
															}}>
															<p className="text-base opacity-100 transition-opacity">{index + 1}</p>
															<svg width="20" height="20" viewBox="0 0 25 25" fill="#fff" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-0 group-hover:opacity-100">
																<path d="M6.76693 21.9879L6.75583 21.9956L6.74514 22.0038C6.45991 22.2232 6 22.0313 6 21.6001V3.40009C6 2.96889 6.45991 2.77699 6.74514 2.99641L6.75634 3.00501L6.76799 3.01298L20.018 12.063L20.018 12.063L20.0226 12.0661C20.3258 12.2682 20.3258 12.682 20.0226 12.8841L20.0226 12.884L20.0169 12.8879L6.76693 21.9879Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
															</svg>
														</div>
													</td>
													<td scope="row" className="px-6 pl-1 py-4 flex gap-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
														<img className="md:w-14 md:h-14 w-16 h-16 rounded" src={track.album.album_image} alt={track.album.album_name} />
														<div>
															<p className="text-white">{track.name}</p>
															<p className="flex flex-wrap gap-1">
																{track.artists.slice(0, 2).map((item, index) => (
																	<span key={index}>
																		<span className={'font-normal text-gray-100 cursor-pointer opacity-60 ' + (index !== 0 ? 'hidden sm:inline' : '')} onClick={() => router.push('/artists/' + item.public_id)}>
																			{item.artist_name}
																			{index !== track.artists.slice(0, 2).length - 1 && <span className="sm:visible hidden">,</span>}
																		</span>
																	</span>
																))}
																<span className="font-normal text-gray-100 opacity-60 visible md:hidden">{track.album.album_name != track.name ? '-' : ''}</span>
																<span className="font-normal text-gray-100 opacity-60 visible md:hidden">{track.album.album_name != track.name ? track.album.album_name : ''}</span>
															</p>
															<p className="font-normal text-gray-100 opacity-60 visible md:hidden">{`${Math.floor(track.duration / 3600) > 0 ? Math.floor(track.duration / 3600) + 'h ' : ''}${Math.floor((track.duration % 3600) / 60)}m ${track.duration % 60}s`}</p>
														</div>
													</td>
													<td className="hidden md:table-cell px-6 py-4">{track.album.album_name}</td>
													<td className="hidden md:table-cell px-6 py-4">{new Date(track.date).toLocaleDateString('en-US')}</td>
													<td className="hidden md:table-cell px-6 py-4">{`${Math.floor(track.duration / 3600) > 0 ? Math.floor(track.duration / 3600) + 'h ' : ''}${Math.floor((track.duration % 3600) / 60)}m ${track.duration % 60}s`}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>
			</main>
		</>
	);
}
