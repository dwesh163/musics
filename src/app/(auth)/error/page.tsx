import { Error } from '@/components/error';
import { AlertCircle } from 'lucide-react';

export default function ErrorPage() {
	return <Error text="An error occurred" subText="We couldn't complete your request. Please try again later" Icon={AlertCircle} color="text-red-500" />;
}
