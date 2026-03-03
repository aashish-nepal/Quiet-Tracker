import AuthPanel from '../../components/auth/AuthPanel';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default async function AuthPage() {
  const token = (await cookies()).get('auth_token')?.value;
  if (token) {
    redirect('/dashboard');
  }
  return (
    <Suspense>
      <AuthPanel />
    </Suspense>
  );
}
