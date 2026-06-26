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

  console.log('Fetching 8CTRL tracks from iTunes API...')
  const res = await fetch('https://itunes.apple.com/search?term=8CTRL&entity=song')
  const data = await res.json()
  const tracks = data.results.filter((t: any) => t.artistName.toUpperCase().includes('8CTRL'))

  console.log(`Found ${tracks.length} tracks!`)

  const conn = await pool.getConnection()

  try {
    // Clear existing
    await conn.query('DELETE FROM Track')
    await conn.query('DELETE FROM `Release`')

    for (const [index, t] of tracks.entries()) {
      const title = t.trackName
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
        const id = Math.random().toString(36).substring(2, 15)
        const type = album.includes('Single') || album.includes('EP') ? 'single' : 'album'
        await conn.query(
          'INSERT INTO `Release` (id, title, releaseYear, coverUrl, appleUrl, type, isFeatured, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [id, album, releaseYear, coverUrl, appleUrl, type, 1]
        )
        console.log(`Created Release: ${album}`)
      }

      // Assign curation flags dynamically based on the loop index to distribute them across whatever tracks iTunes returns
      const isFeatured = index === 0
      const isArtistFav = index === 1 || index === 4
      const isFanFav = index === 2 || index === 3
      const isTrending = index === 0 || index === 2
      const isRecommended = index === 3 || index === 4
      const isLatest = index === 0 || index === 1

      // Create Track
      const trackId = Math.random().toString(36).substring(2, 15)
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

    // Seed default CMS settings
    console.log('Seeding default CMS settings...');
    const defaultSettings = [
      {
        key: 'artist_profile',
        value: JSON.stringify({
          name: '8CTRL',
          realName: 'Ankur',
          heroText: 'BLOOD RED CINEMATIC',
          biography: 'A pioneer of underground atmospheric hip-hop based in Jammu. Blending dense lyrical delivery with cinematic, aggressive, and emotional static soundscapes.',
          location: 'Jammu & Kashmir // 32.73° N, 74.87° E',
          genres: ['Hip-Hop/Rap', 'Industrial', 'Cinematic Ambient'],
          socialLinks: {
            instagram: 'https://instagram.com/8ctrl',
            youtube: 'https://youtube.com/8ctrl',
            twitter: 'https://twitter.com/8ctrl',
          },
          streamingLinks: {
            spotify: 'https://open.spotify.com/artist/0SZI7o0l7PAyfvIKDDm3DV',
            appleMusic: 'https://music.apple.com/us/song/sukuna/6771417507',
          },
          brandColors: {
            primaryBackground: '#050505',
            surface: '#0E0E0E',
            elevatedSurface: '#181818',
            bloodRed: '#8B0000',
            crimsonAccent: '#C1121F',
            highlightRed: '#E63946',
          },
          homepageIntro: 'The music data exists to drive the experience. Walk through a dark digital gallery illuminated by deep crimson lights.',
        })
      },
      {
        key: 'seo_config',
        value: JSON.stringify({
          title: '8CTRL // Cinematic Fan Experience',
          description: 'An immersive digital installation dedicated to Jammu rapper 8CTRL. Discover discography, visual narratives, and synced lyrics.',
          keywords: ['8CTRL', 'Jammu Rap', 'Atmospheric Hip Hop', 'Cinematic Music Experience'],
          ogImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop',
          twitterCard: 'summary_large_image',
        })
      },
      {
        key: 'homepage_layout',
        value: JSON.stringify({
          sections: [
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
          ]
        })
      },
      {
        key: 'timeline_events',
        value: JSON.stringify([
          { year: '2025', title: 'THE CHAOS ERA', desc: 'The release of the full-length album "Chaos" in October 2025 marks a pivotal moment, featuring heavy-hitting tracks like "Discipline" and collaborative universe building.' },
          { year: 'JAN 2026', title: 'SESH IN THE POOL', desc: 'Kicking off the new year with "Sesh in the Pool", maintaining momentum and expanding his signature dark atmosphere.' },
          { year: 'FEB-MAR 2026', title: 'NO MELODY & PILLS', desc: 'Drops "No Melody" followed closely by "Pills" in March, showcasing dense lyricism and cold, driving production.' },
          { year: 'APR-MAY 2026', title: '911 & SUKUNA', desc: 'The intensity continues to scale up with the release of "911", followed by the hard-hitting single "SUKUNA" in late May.' }
        ])
      },
      {
        key: 'verified_quotes',
        value: JSON.stringify([
          { text: "8CTRL is redefining the texture of Indian underground hip-hop. The soundscapes are not tracks; they are cinematic environments.", author: "Press Curation", source: "Underground Review" },
          { text: "Every release feels like entering a dark, crimson-lit gallery. You walk in for the rhythm, but stay for the atmosphere.", author: "Fan Echo", source: "Community Hub" }
        ])
      }
    ];

    for (const setting of defaultSettings) {
      await conn.query(
        'INSERT INTO Setting (`key`, `value`, `updatedAt`) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE `value` = ?, `updatedAt` = NOW()',
        [setting.key, setting.value, setting.value]
      );
      console.log(`Seeded Setting key: ${setting.key}`);
    }

    console.log('Database seeded successfully with real 8CTRL data!')
  } finally {
    conn.release()
    await pool.end()
  }
}

seed().catch(console.error)
