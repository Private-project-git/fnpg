import React from 'react';
import { ContentProvider } from '@/lib/contentProvider';
import { HomeClient } from '@/components/HomeClient';

export default async function Home() {
  // Retrieve settings and releases directly on the server-side
  // This makes the public website un-scrappable via simple JSON endpoint requests
  const settings = await ContentProvider.getSettings();
  const releases = await ContentProvider.getReleases();

  return (
    <HomeClient 
      initialSettings={settings} 
      initialReleases={releases} 
    />
  );
}
