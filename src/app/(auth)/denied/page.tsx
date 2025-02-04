import { Error } from '@/components/error';
import { Ban } from 'lucide-react';

export default function DeniedPage() {
	return <Error text="Access Denied" subText="You do not have permission to access this application" Icon={Ban} color="text-red-500" />;
}
