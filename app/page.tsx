import { redirect } from 'next/navigation';

// Root "/" always redirects — middleware handles auth destination
export default function Home() {
  redirect('/dashboard');
}
