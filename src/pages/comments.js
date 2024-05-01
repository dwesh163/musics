import Head from 'next/head';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Player from '@/components/player';
import Menu from '@/components/menu';
import Loading from '@/components/loading';
import Comments from '@/components/comments';
import { useRouter } from 'next/router';
import packageJson from '/package.json';

export default function PlayList() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [isLoading, setIsLoading] = useState(false);
	const [isStarted, setIsStarted] = useState(false);

	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		if (!session || status == 'loading' || status == 'unauthenticated') {
			setIsLoading(true);
			return;
		}
		if (packageJson && packageJson.version && packageJson.version != session.user.version) {
			router.push('/auth/signin?callbackUrl=' + router.asPath);
		} else if (!session.user.access) {
			router.push('/error?error=AccessDenied');
		} else {
			setIsLoading(false);
		}
	}, [session]);

	if (isLoading) {
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
			<main className="w-screen h-screen">
				<div className="w-full h-full relative flex overflow-hidden bg-[#171719]">
					<Player isStarted={isStarted} setIsStarted={setIsStarted} />
					<Menu isOpen={isOpen} setIsOpen={setIsOpen} />
					<div
						className="w-full h-full overflow-hidden"
						onClick={() => {
							if (isOpen) setIsOpen(false);
						}}>
						<div className="w-full p-5 pl-4 sm:p-7 pb-0 sm:pb-0 flex justify-between">
							<h1 className="text-3xl mb-0 font-extrabold leading-none tracking-tight md:text-4xl lg:text-6xl text-white">Index</h1>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={toggleMenu} className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer sm:hidden" preserveAspectRatio="none">
								<path d="M6.5 12C6.5 12.5523 6.05228 13 5.5 13C4.94772 13 4.5 12.5523 4.5 12C4.5 11.4477 4.94772 11 5.5 11C6.05228 11 6.5 11.4477 6.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
								<path d="M19.5 12C19.5 12.5523 19.0523 13 18.5 13C17.9477 13 17.5 12.5523 17.5 12C17.5 11.4477 17.9477 11 18.5 11C19.0523 11 19.5 11.4477 19.5 12Z" fill="#FCFCFC" stroke="#FCFCFC"></path>
							</svg>
						</div>

						<div className="sm:px-7 px-4 overflow-y-scroll">
							<div className="w-full py-3">
								<div className="mb-3">
									<span className="text-white ">This site is under development. If you can see this, it's because we've granted you access to the demo. If you find a bug or want a new feature or option, write to us here. </span>
								</div>
								<Comments />
							</div>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
