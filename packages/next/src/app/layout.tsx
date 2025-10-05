import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';

import './globals.css';
import './loading.css';
import './ckeditor.css';

import { InnerLayout } from './inner-layout';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: 'rgb(17, 24, 39)' },
  ],
};

export const metadata: Metadata = {
  title: 'Justnote - Simple & Private Taking Notes',
  description: 'A simple, fast, privacy-focused note-taking app that you can use easily, take notes rapidly, and, importantly, truly own your account and data.',
  openGraph: {
    title: 'Justnote - Simple & Private Taking Notes',
    description: 'A simple, fast, privacy-focused note-taking app that you can use easily, take notes rapidly, and, importantly, truly own your account and data.',
    images: [
      {
        url: 'https://justnote.cc/twitter-card-image-pattern1.png',
      },
    ],
    siteName: 'Justnote',
    url: 'https://justnote.cc',
    type: 'website',
  },
  twitter: {
    title: 'Justnote - Simple & Private Taking Notes',
    description: 'A simple, fast, privacy-focused note-taking app that you can use easily, take notes rapidly, and, importantly, truly own your account and data.',
    images: ['https://justnote.cc/twitter-card-image-pattern1.png'],
    card: 'summary_large_image',
    site: '@justnotecc',
  },
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <InnerLayout>
          {children}
        </InnerLayout>
        <Script id="ios-viewport-mod" strategy="afterInteractive">{`
          const isIPadIPhoneIPod = () => {
            const ua = navigator.userAgent;
            if (/iPad|iPhone|iPod/.test(ua)) {
              return true;
            }
            if (/Mac OS X/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua) && !/Firefox/.test(ua)) {
              return true;
            }
            return false;
          };

          const addMaximumScaleToMetaViewport = () => {
            const el = document.querySelector('meta[name=viewport]');
            if (el !== null) {
              let content = el.getAttribute('content');
              const re = /maximum\-scale=[0-9\.]+/g;

              if (re.test(content)) content = content.replace(re, 'maximum-scale=1.0');
              else content = [content, 'maximum-scale=1.0'].join(', ');

              el.setAttribute('content', content);
            }
          };

          if (isIPadIPhoneIPod()) addMaximumScaleToMetaViewport();
        `}</Script>
        <Script src="https://cdn.paddle.com/paddle/paddle.js" />
      </body>
    </html>
  );
}
