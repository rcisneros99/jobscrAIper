'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    // Only redirect from auth pages (sign-in, sign-up) if user is signed in
    if (isLoaded && isSignedIn && window.location.pathname.includes('/sign-')) {
      redirect('/features/search');
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <div className="min-h-screen">{children}</div>;
}
