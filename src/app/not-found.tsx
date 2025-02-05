import { Error } from '@/components/error';
import { CircleAlert } from 'lucide-react';

export default function NotFoundPage() {
	return <Error text="Page not found" subText="The page you are looking for does not exist" Icon={CircleAlert} color="text-orange-500" />;
}
