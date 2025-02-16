import { FormExamples } from '@/lib/form-builder/examples'

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Form Builder Examples</h1>
        <p className="text-gray-600 dark:text-gray-300">
          A collection of form examples built with our custom form builder hook
        </p>
      </header>

      <main className="max-w-4xl mx-auto">
        <FormExamples />
      </main>

      <footer className="mt-20 text-center text-sm text-gray-500">
        <p>Built with custom form builder hook - No external form libraries</p>
      </footer>
    </div>
  )
}
