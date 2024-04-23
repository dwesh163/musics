import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Player from '@/components/player';
import Menu from '@/components/menu';
import Loading from '@/components/loading';
import { useRouter } from 'next/router';
import packageJson from '/package.json';

export default function Tracks() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [playlist, setPlaylist] = useState(undefined);
	const [results, setResults] = useState([]);
	const [songId, setSongId] = useState('');

	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		if (!router.query.s || router.query.s === search || router.query.s === '') {
			return;
		}

		setSearch(router.query.s);
		fetchData(router.query.s);
	}, [router.query.s]);

	const fetchData = async (search) => {
		try {
			const response = await fetch(`/api/tracks/search/?songName=${search.split(';')[0]}&artistName=${search.split(';')[1]}`);
			const tracksData = await response.json();
			setResults(tracksData);
			if (router.query.s != search) {
				router.push({ query: { s: search } });
			}
			setIsLoading(false);
		} catch (error) {}
	};

	const downloadSong = async (id) => {
		const response = await fetch('/api/tracks/', { method: 'POST', body: JSON.stringify({ spotifyId: id }) });
		const tracksData = await response.json();
		const trackIndex = results.findIndex((track) => track.id === id);

		console.log(tracksData);
		if (tracksData.download == 'true') {
			if (trackIndex !== -1) {
				const updatedResults = [...results];
				updatedResults[trackIndex].loading = false;
				setResults(updatedResults);
			}
			setSongId(tracksData.id);
		}
		if (tracksData.download == 'progress') {
			if (trackIndex !== -1) {
				const updatedResults = [...results];
				updatedResults[trackIndex].loading = true;
				setResults(updatedResults);
			}

			setTimeout(() => {
				downloadSong(id);
			}, 8000);
		}
	};

	if (status == 'loading' || status == 'unauthenticated' || isLoading) {
		return <Loading status={isLoading ? 'loading' : status} />;
	}

	if (packageJson && packageJson.version && packageJson.version != session.user.version) {
		router.push('/auth/signin?callbackUrl=' + router.asPath);
	}

	return (
		<>
			<Head>
				<title>Music</title>
				<meta name="description" content="Generated by create next app" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="w-full h-full overflow-hidden bg-[#171719]">
				<div className="w-full h-full flex overflow-hidden bg-[#171719]">
					<Player songId={songId} setSongId={setSongId} playlist={playlist} />
					<Menu isOpen={isOpen} setIsOpen={setIsOpen} />
					<div className="w-full h-full overflow-hidden">
						<div className="w-full p-5 pl-4 sm:p-7 pb-0 sm:pb-0 flex justify-between">
							<h1 className="text-3xl mb-0 font-extrabold leading-none tracking-tight md:text-4xl lg:text-6xl text-white">Search</h1>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleMenu} className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer sm:hidden" preserveAspectRatio="none">
								<path d="M6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M19.5 12C19.5 12.5523 19.0523 13 18.5 13C17.9477 13 17.5 12.5523 17.5 12C17.5 11.4477 17.9477 11 18.5 11C19.0523 11 19.5 11.4477 19.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						</div>

						<div className="sm:px-7 px-4 overflow-y-scroll">
							<div className="w-full py-3">
								<label htmlFor="default-search" className="mb-2 text-sm font-medium  sr-only text-white">
									Search
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
										<svg className="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
											<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
										</svg>
									</div>
									<input
										type="search"
										onKeyDown={(event) => {
											if (event.key === 'Enter') {
												fetchData(search);
											}
										}}
										className="block w-full p-4 ps-10 text-sm text-gray-100 bg-[#27272b] focus:outline-none"
										placeholder="Search Tracks, Artists, Albums..."
										value={search}
										onChange={(event) => setSearch(event.target.value)}
										required
									/>
									<button onClick={() => fetchData(search)} className="text-white absolute end-2.5 bottom-2 bg-[#00a5a5] hover:bg-[#038080] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-4 py-2">
										Search
									</button>
								</div>
							</div>

							<div className="overflow-x-scroll h-[calc(100vh-210px)]">
								{results.error ? (
									<div className="text-white w-full h-full flex items-center justify-center">Song Not Found</div>
								) : (
									<table className="w-full text-sm text-left rtl:text-right text-gray-400">
										<thead className="text-xs uppercase text-gray-400 w-full">
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
										<tbody>
											{results?.map((track, index) => (
												<tr key={index + '-track'} className="bg-[#11111170] hover:bg-[#1d1d1d70] group">
													<td className="relative">
														{track.loading ? (
															<div className="text-center flex items-center justify-center" onClick={() => downloadSong(track.id)}>
																<svg aria-hidden="true" className="w-4 h-4 text-gray-800 animate-spin fill-sky-500 bg-opacity-90" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
																	<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
																</svg>
															</div>
														) : (
															<div className="text-center flex items-center justify-center group-hover:text-transparent group-hover:cursor-pointer" onClick={() => downloadSong(track.id)}>
																<p className="text-base opacity-100 transition-opacity">{index + 1}</p>
																<svg width="20" height="20" viewBox="0 0 25 25" fill="#fff" xmlns="http://www.w3.org/2000/svg" className="absolute opacity-0 group-hover:opacity-100">
																	<path d="M6.76693 21.9879L6.75583 21.9956L6.74514 22.0038C6.45991 22.2232 6 22.0313 6 21.6001V3.40009C6 2.96889 6.45991 2.77699 6.74514 2.99641L6.75634 3.00501L6.76799 3.01298L20.018 12.063L20.018 12.063L20.0226 12.0661C20.3258 12.2682 20.3258 12.682 20.0226 12.8841L20.0226 12.884L20.0169 12.8879L6.76693 21.9879Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
																</svg>
															</div>
														)}
													</td>
													<td scope="row" className="px-6 pl-1 py-4 flex gap-2 font-medium whitespace-nowrap text-white overflow-hidden">
														<img className="md:w-14 md:h-14 w-16 h-16 rounded" src={track.album.images[0].url} alt={track.album.album_name} />
														<div>
															<p>{track.name}</p>
															<p className="flex flex-wrap gap-1">
																{track.artists.slice(0, 2).map((item, index) => (
																	<span key={index}>
																		<span className={'font-normal text-gray-100 cursor-pointer opacity-60 ' + (index !== 0 ? 'hidden sm:inline' : '')} onClick={() => router.push('/artists/' + item.public_id)}>
																			{item.name}
																			{index !== track.artists.slice(0, 2).length - 1 && ','}
																		</span>
																	</span>
																))}
																<p className="font-normal text-gray-100 opacity-60 visible md:hidden">{track.album.name != track.name ? '-' : ''}</p>
																<p className="font-normal text-gray-100 opacity-60 visible md:hidden">{track.album.name != track.name ? track.album.name : ''}</p>
															</p>
															<p className="font-normal text-gray-100 opacity-60 visible md:hidden">{`${Math.floor(track.duration_ms / 1000 / 3600) > 0 ? Math.floor(track.duration_ms / 1000 / 3600) + 'h ' : ''}${Math.floor(((track.duration_ms / 1000) % 3600) / 60)}m ${track.duration_ms % 60}s`}</p>
														</div>
													</td>
													<td className="hidden md:table-cell px-6 py-4">{track.album.name}</td>
													<td className="hidden md:table-cell px-6 py-4">{new Date(track.album.release_date).toLocaleDateString('en-US')}</td>
													<td className="hidden md:table-cell px-6 py-4">{`${Math.floor(track.duration_ms / 1000 / 3600) > 0 ? Math.floor(track.duration_ms / 1000 / 3600) + 'h ' : ''}${Math.floor(((track.duration_ms / 1000) % 3600) / 60)}m ${track.duration_ms % 60}s`}</td>
												</tr>
											))}
										</tbody>
									</table>
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
