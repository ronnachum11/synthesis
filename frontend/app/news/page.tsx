'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.push('/news/15db7a48-eaca-42b8-b3f9-1e11cef77792');
  }, [router]);

  return null; // Render nothing or a loading indicator while redirecting
}