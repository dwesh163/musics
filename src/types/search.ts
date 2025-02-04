export type SearchResultItemProps = {
	image: string;
	title: string;
	subtitle: string;
	linkHref: string;
};

export type TrackAction = {
	icon: React.ReactNode;
	onClick: (e: React.MouseEvent) => void;
	highlight?: boolean;
};
