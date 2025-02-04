import Image from 'next/image';
import Link from 'next/link';
import { SearchResultItemProps } from '@/types/search';

export const SearchResultItem = ({ image, title, subtitle, linkHref }: SearchResultItemProps) => {
	return (
		<Link href={linkHref} className="block">
			<div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 hover:bg-gray-800/50 rounded-lg group">
				<div className="relative flex-shrink-0">
					<Image src={image || '/placeholder.png'} alt={title} width={48} height={48} className="rounded object-cover w-12 h-12 sm:w-14 sm:h-14" />
				</div>
				<div className="flex-1 min-w-0 pr-2">
					<h3 className="font-bold text-sm sm:text-base truncate max-w-[50vw]">{title}</h3>
					<p className="text-xs sm:text-sm text-gray-400 truncate max-w-[50vw]">{subtitle}</p>
				</div>
			</div>
		</Link>
	);
};
