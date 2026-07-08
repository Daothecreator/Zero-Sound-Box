"use client";
import React from 'react';
import AcousticSynthesizer from '@/components/AcousticSynthesizer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 md:p-24 relative overflow-hidden">
      <AcousticSynthesizer />
    </main>
  );
}
