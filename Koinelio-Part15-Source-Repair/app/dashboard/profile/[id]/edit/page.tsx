import { redirect } from 'next/navigation';

export default function LegacyProfileEditRoute() {
  redirect('/dashboard/profile');
}
