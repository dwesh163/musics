'use server';
import { Error } from '@/components/error';
import { History } from '@/components/history';
import { getHistory } from '@/lib/log';
import { AlertCircle } from 'lucide-react';

export default async function HistoryPage() {
	try {
		const history = await getHistory();

		if (!history) {
			return <Error text="Something went wrong" subText="We couldn't get your search. Please try again later" Icon={AlertCircle} color="text-red-500" />;
		}

		return (
			<div className="w-full h-full sm:px-6 px-3">
				<h1 className="sm:text-2xl text-xl sm:font-bold font-semibold sm:my-6 my-2">History</h1>
				<History history={history} />
			</div>
		);
	} catch (error) {
		console.error('History page error:', error);
		return <Error text="Something went wrong" subText="We couldn't get your search. Please try again later" Icon={AlertCircle} color="text-red-500" />;
	}
}
