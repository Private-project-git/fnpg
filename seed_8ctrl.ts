import mariadb from 'mariadb'
import 'dotenv/config'

async function seed() {
  const pool = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Oracle@123',
    database: 'fanpage'
  })

  console.log('Fetching 8CTRL tracks from iTunes API (Artist Lookup)...')
  const res = await fetch('https://itunes.apple.com/lookup?id=1868401922&entity=song&limit=200')
  const data = await res.json()
  const tracks = data.results.filter((t: any) => t.wrapperType === 'track')

  console.log(`Found ${tracks.length} tracks!`)

  const conn = await pool.getConnection()

  try {
    // Clear existing
    await conn.query('DELETE FROM Track')
    await conn.query('DELETE FROM `Release`')

    for (const [index, t] of tracks.entries()) {
      let title = t.trackName
      if (title === 'F**k You Bro') {
        title = 'Fuck You Bro';
      }
      const album = t.collectionName || ''
      const releaseYear = new Date(t.releaseDate).getFullYear()
      const coverUrl = t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null
      const appleUrl = t.trackViewUrl
      const previewUrl = t.previewUrl
      const genre = t.primaryGenreName || 'Electronic'
      const duration = t.trackTimeMillis ? Math.round(t.trackTimeMillis / 1000) : 30

      // Create Release
      const releases = await conn.query('SELECT * FROM `Release` WHERE title = ?', [album])
      if (releases.length === 0) {
        const id = album.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || Math.random().toString(36).substring(2, 15)
        const type = album.toLowerCase().includes('single') || album.toLowerCase().includes('ep') ? 'single' : 'album'
        await conn.query(
          'INSERT INTO `Release` (id, title, releaseYear, coverUrl, appleUrl, type, isFeatured, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [id, album, releaseYear, coverUrl, appleUrl, type, 1]
        )
        console.log(`Created Release: ${album}`)
      }

      // Assign curation flags deterministically based on track title
      const cleanT = title.toLowerCase();
      const isFeatured = cleanT === 'fuck you bro' || cleanT === 'sukuna';
      const isArtistFav = cleanT === 'fuck you bro' || cleanT === '911' || cleanT === 'sesh in the pool';
      const isFanFav = cleanT === 'pills' || cleanT === 'no-melody';
      const isTrending = cleanT === 'fuck you bro' || cleanT === 'sukuna' || cleanT === 'pills';
      const isRecommended = cleanT === 'no-melody' || cleanT === 'sesh in the pool';
      const isLatest = cleanT === 'fuck you bro' || cleanT === 'sukuna' || cleanT === '911';

      // Create Track with clean, readable ID matching fallback keys
      const trackId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await conn.query(
        'INSERT INTO Track (id, title, artist, album, coverUrl, previewUrl, appleUrl, genre, duration, isFeatured, isArtistFav, isFanFav, isTrending, isRecommended, isLatest, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          trackId, 
          title, 
          t.artistName, 
          album, 
          coverUrl, 
          previewUrl, 
          appleUrl, 
          genre, 
          duration, 
          isFeatured ? 1 : 0, 
          isArtistFav ? 1 : 0, 
          isFanFav ? 1 : 0, 
          isTrending ? 1 : 0, 
          isRecommended ? 1 : 0, 
          isLatest ? 1 : 0
        ]
      )
      console.log(`Created Track: ${title} with flags [feat:${isFeatured}, artist:${isArtistFav}, fan:${isFanFav}, trend:${isTrending}]`)
    }

    // Seed default AppConfig
    console.log('Seeding default AppConfig settings...');
    await conn.query('DELETE FROM AppConfig');
    await conn.query(
      'INSERT INTO AppConfig (id, artistName, artistRealName, heroText, biography, location, genres, homepageIntro, primaryBackground, surface, elevatedSurface, bloodRed, crimsonAccent, highlightRed, borderRadius, glassBlur, componentSpacing, animationSpeed, filmGrainOpacity, vignetteSize, defaultVolume, fadeDurationSec, glitchSfxEnabled, glitchOscType, glitchStartFreq, glitchEndFreq, seoTitle, seoDescription, seoKeywords, ogImage, twitterCard, instagramUrl, youtubeUrl, twitterUrl, spotifyUrl, appleMusicUrl, homepageSections, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [
        'default-config',
        '8CTRL',
        'Ankur',
        'BLOOD RED CINEMATIC',
        'A pioneer of underground atmospheric hip-hop based in Jammu. Blending dense lyrical delivery with cinematic, aggressive, and emotional static soundscapes.',
        'Jammu & Kashmir // 32.73° N, 74.87° E',
        JSON.stringify(['Hip-Hop/Rap', 'Industrial', 'Cinematic Ambient']),
        'The music data exists to drive the experience. Walk through a dark digital gallery illuminated by deep crimson lights.',
        '#050505',
        '#0E0E0E',
        '#181818',
        '#8B0000',
        '#C1121F',
        '#E63946',
        4,
        12,
        32,
        1.0,
        6,
        150,
        0.8,
        1.5,
        1, // true
        'sawtooth',
        900.0,
        80.0,
        '8CTRL // Cinematic Fan Experience',
        'An immersive digital installation dedicated to Jammu rapper 8CTRL. Discover discography, visual narratives, and synced lyrics.',
        JSON.stringify(['8CTRL', 'Jammu Rap', 'Atmospheric Hip Hop', 'Cinematic Music Experience']),
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
        'summary_large_image',
        'https://instagram.com/8ctrl',
        'https://youtube.com/8ctrl',
        'https://twitter.com/8ctrl',
        'https://open.spotify.com/artist/0SZI7o0l7PAyfvIKDDm3DV',
        'https://music.apple.com/us/song/sukuna/6771417507',
        JSON.stringify([
          { id: 'hero', enabled: true, name: 'Hero' },
          { id: 'identity', enabled: true, name: 'Identity' },
          { id: 'featured', enabled: true, name: 'Featured Releases' },
          { id: 'artist-favs', enabled: true, name: 'Artist Favorites' },
          { id: 'fan-favs', enabled: true, name: 'Fan Favorites' },
          { id: 'trending', enabled: true, name: 'Trending Analytics' },
          { id: 'discography', enabled: true, name: 'Timeline Discography' },
          { id: 'gallery', enabled: true, name: 'Cinematic Gallery' },
          { id: 'quotes', enabled: true, name: 'Verified Quotes' },
          { id: 'platforms', enabled: true, name: 'Platform links' },
          { id: 'credits', enabled: true, name: 'Credits' },
        ])
      ]
    );
    console.log('AppConfig seeded successfully!');

    // Seed default Quote
    console.log('Seeding default quotes...');
    await conn.query('DELETE FROM Quote');
    const quotes = [
      { text: "8CTRL is redefining the texture of Indian underground hip-hop. The soundscapes are not tracks; they are cinematic environments.", author: "Press Curation", source: "Underground Review" },
      { text: "Every release feels like entering a dark, crimson-lit gallery. You walk in for the rhythm, but stay for the atmosphere.", author: "Fan Echo", source: "Community Hub" }
    ];
    for (const [i, q] of quotes.entries()) {
      const id = Math.random().toString(36).substring(2, 15);
      await conn.query(
        'INSERT INTO Quote (id, text, author, source, status, displayOrder, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [id, q.text, q.author, q.source, 'published', i]
      );
    }
    console.log('Quotes seeded successfully!');

    // Seed default TimelineEvent
    console.log('Seeding default timeline events...');
    await conn.query('DELETE FROM TimelineEvent');
    const events = [
      { year: '2025', title: 'THE CHAOS ERA', desc: 'The release of the full-length album "Chaos" in October 2025 marks a pivotal moment, featuring heavy-hitting tracks like "Discipline" and collaborative universe building.' },
      { year: 'JAN 2026', title: 'SESH IN THE POOL', desc: 'Kicking off the new year with "Sesh in the Pool", maintaining momentum and expanding his signature dark atmosphere.' },
      { year: 'FEB-MAR 2026', title: 'NO MELODY & PILLS', desc: 'Drops "No Melody" followed closely by "Pills" in March, showcasing dense lyricism and cold, driving production.' },
      { year: 'APR-MAY 2026', title: '911 & SUKUNA', desc: 'The intensity continues to scale up with the release of "911", followed by the hard-hitting single "SUKUNA" in late May.' }
    ];
    for (const [i, e] of events.entries()) {
      const id = Math.random().toString(36).substring(2, 15);
      await conn.query(
        'INSERT INTO TimelineEvent (id, year, title, description, displayOrder, updatedAt) VALUES (?, ?, ?, ?, ?, NOW())',
        [id, e.year, e.title, e.desc, i]
      );
    }
    console.log('TimelineEvents seeded successfully!');

    console.log('Database seeded successfully with real 8CTRL data!')
  } finally {
    conn.release()
    await pool.end()
  }
}

seed().catch(console.error)
