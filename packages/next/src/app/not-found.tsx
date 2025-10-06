import Link from '@/components/CustomLink';

export default function NotFound() {
  return (
    <div className="bg-white px-4 py-16 lg:pl-8 lg:pr-0 xl:px-16">
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-white">404</p>
        <h1 className="mt-3 text-3xl tracking-tight text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sorry, we couldn’t find the page you’re looking for.</p>
        <Link href="/" className="mt-8 text-sm font-medium text-gray-900 dark:text-white">Go back home</Link>
      </div>
    </div>
  );
}
