"use client";
import React from 'react';
import AcousticSynthesizer from '@/components/AcousticSynthesizer';

export default function Home() {
  return (
    <main className="flex flex-col items-center bg-transparent p-2 md:p-12 relative w-full min-h-screen">
      <AcousticSynthesizer />
    </main>
  );
}
