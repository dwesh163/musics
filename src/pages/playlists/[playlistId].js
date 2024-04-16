import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Player from '@/components/player';
import Menu from '@/components/menu';
import { useRouter } from 'next/router';
import Loading from '@/components/loading';

export default function Home() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(true);
	const [playlist, setPlaylist] = useState({});
	const [songId, setSongId] = useState('');

	useEffect(() => {
		if (!router.query.playlistId) {
			return;
		}
		const fetchData = async () => {
			try {
				const response = await fetch('/api/playlist/' + router.query.playlistId);
				const playlistData = await response.json();
				setPlaylist(playlistData);
				setIsLoading(false);
			} catch (error) {
				console.error('Error fetching audio data:', error);
			}
		};

		fetchData();
	}, [router.query.playlistId]);

	if (status == 'loading' || status == 'unauthenticated' || isLoading) {
		return <Loading status={isLoading ? 'loading' : status} />;
	}

	return (
		<>
			<Head>
				<title>Music</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="w-screen h-screen bg-[#171719]">
				<div className="w-full h-full relative flex overflow-hidden bg-[#171719]">
					<Player songId={songId} setSongId={setSongId} playlist={playlist} />
					<Menu />
					{playlist.error ? (
						<div className="h-[calc(100vh-101px)] w-full flex items-center justify-center text-white">Playlist not Found</div>
					) : (
						<div className="w-full h-full overflow-hidden">
							<div className="w-full p-7 pb-0">
								<h1 className=" text-3xl mb-0 font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-6xl dark:text-white">{playlist.playlist.name}</h1>
								<p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
									{playlist.tracks.length} Track{playlist.tracks.length > 1 ? 's' : ''}
								</p>
							</div>
							<div className="px-7 overflow-x-scroll h-[calc(100vh-250px)]">
								<table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
									<thead className="text-xs text-gray-900 uppercase dark:text-gray-400 w-full">
										<tr>
											<th scope="col" className="px-3 py-1 text-center">
												#
											</th>
											<th scope="col" className="px-0 py-3">
												Track
											</th>
											<th scope="col" className="px-6 py-3">
												Album
											</th>
											<th scope="col" className="px-6 py-3">
												Date
											</th>
											<th scope="col" className="px-6 py-3">
												Duration
											</th>
										</tr>
									</thead>
									<tbody className="">
										{playlist.tracks.map((track, index) => (
											<tr key={index + '-track'} className="bg-[#11111170] hover:bg-[#1d1d1d70] group">
												<td className="relative">
													<div className="text-center flex items-center justify-center group-hover:text-transparent group-hover:cursor-pointer" onClick={() => setSongId(track.track_public_id)}>
														<p className="text-base opacity-100 transition-opacity">{index}</p>
														<svg width="20" height="20" viewBox="0 0 25 25" fill="#fff" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-0 group-hover:opacity-100">
															<path d="M6.76693 21.9879L6.75583 21.9956L6.74514 22.0038C6.45991 22.2232 6 22.0313 6 21.6001V3.40009C6 2.96889 6.45991 2.77699 6.74514 2.99641L6.75634 3.00501L6.76799 3.01298L20.018 12.063L20.018 12.063L20.0226 12.0661C20.3258 12.2682 20.3258 12.682 20.0226 12.8841L20.0226 12.884L20.0169 12.8879L6.76693 21.9879Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
														</svg>
													</div>
												</td>
												<th scope="row" className="px-6 pl-1 py-4 flex gap-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
													<img className="md:w-14 md:h-14 w-8 h-8 rounded" src={track.album.album_image} alt={track.album.album_name} />
													<div>
														<p>{track.name}</p>
														{track.artists.slice(0, 2).map((item, index) => (
															<span className="font-normal text-gray-100 opacity-60 cursor-pointer" key={index} onClick={() => router.push('/artists/' + item.public_id)}>
																{item.artist_name}
																{index !== track.artists.length - 1 && <span>, </span>}
															</span>
														))}
													</div>
												</th>
												<td className="px-6 py-4">{track.album.album_name}</td>
												<td className="px-6 py-4">Today</td>
												<td className="px-6 py-4">{`${Math.floor(track.duration / 3600) > 0 ? Math.floor(track.duration / 3600) + 'h ' : ''}${Math.floor((track.duration % 3600) / 60)}m ${track.duration % 60}s`}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			</main>
		</>
	);
}
