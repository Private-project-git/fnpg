import type { Metadata } from 'next';
import { Inter, Bebas_Neue, Syne } from 'next/font/google';
import { AudioProvider } from '@/audio/AudioContext';
import { ScrollProvider } from '@/components/ScrollProvider';
import { CustomCursor } from '@/components/CustomCursor';
import { BackgroundEngine } from '@/components/BackgroundEngine';
import { ErrorProvider } from '@/components/ErrorProvider';
import { ContentProvider } from '@/lib/contentProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '8CTRL // Cinematic Fan Experience',
  description: 'An immersive digital installation dedicated to Jammu rapper 8CTRL. Discover discography, visual narratives, and synced lyrics.',
  authors: [{ name: '8CTRL Fans' }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Query tracks directly on the server to bypass client-side REST endpoint fetches
  const tracks = await ContentProvider.getTracks();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} ${syne.variable} h-full bg-[#050505] selection:bg-blood-red selection:text-white`}
    >
      <body className="min-h-full overflow-x-hidden text-foreground antialiased font-sans">
        <ErrorProvider>
          <AudioProvider initialTracks={tracks}>
            <ScrollProvider>
              {/* Film Grain & Cinematic Vignette */}
              <div className="noise-overlay" aria-hidden="true" />
              <div className="vignette" aria-hidden="true" />
              
              {/* Evolving Volumetric Background Engine */}
              <BackgroundEngine />
              
              {/* Custom Interactive Cursor */}
              <CustomCursor />
              
              {/* Main Application Container */}
              <main className="relative z-10 w-full min-h-screen">
                {children}
              </main>
            </ScrollProvider>
          </AudioProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
