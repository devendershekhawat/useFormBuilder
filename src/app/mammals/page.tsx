import type { Metadata } from 'next'
import { Fraunces } from 'next/font/google'
import MammalExplorer from '@/components/mammals/MammalExplorer'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'The Mammal Tree',
  description: 'Explore the mammal family tree as floating bubbles — closer relatives drift closer together.',
}

export default function MammalsPage() {
  return (
    <main className={fraunces.variable}>
      <MammalExplorer />
    </main>
  )
}
