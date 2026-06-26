import { Track as NormalizedTrack } from '@/types/domain';

export const AMBIENT_TRACKS: NormalizedTrack[] = [
  {
    id: 'ambient-1',
    title: 'Immersion Ambience',
    artist: '8CTRL',
    album: 'Atmosphere',
    artwork: { url: '' },
    preview: {
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      duration: 300,
    },
    releaseDate: '2026',
    genre: 'Ambient',
    duration: 300,
    platforms: {},
    theme: {
      featured: false,
      artistFavorite: false,
      fanFavorite: false,
      trending: false,
      recommended: false,
      latest: false,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#8B0000',
      backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.12) 0%, #050505 85%)',
      particlePreset: 'ash',
      lightingPreset: 'soft',
      transitionStyle: 'fade',
      typographyStyle: 'font-bebas tracking-widest text-blood-red',
    }
  },
  {
    id: 'ambient-2',
    title: 'Vinyl Crackle & Tape Noise',
    artist: 'Atmosphere',
    album: 'Static',
    artwork: { url: '' },
    preview: {
      url: 'https://www.soundjay.com/misc/sounds/record-crackle-01.mp3',
      duration: 60,
    },
    releaseDate: '2026',
    genre: 'Noise',
    duration: 60,
    platforms: {},
    theme: {
      featured: false,
      artistFavorite: false,
      fanFavorite: false,
      trending: false,
      recommended: false,
      latest: false,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#3A0007',
      backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(58, 0, 7, 0.08) 0%, #050505 100%)',
      particlePreset: 'noise',
      lightingPreset: 'none',
      transitionStyle: 'fade',
      typographyStyle: 'font-syne tracking-[0.4em] text-white/50',
    }
  }
];

export const FALLBACK_SONGS: NormalizedTrack[] = [
  {
    id: 'fuck-you-bro',
    title: 'Fuck You Bro',
    artist: '8CTRL',
    album: 'Fuck You Bro - Single',
    artwork: {
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/45/9c/73/459c7369-7198-0ee8-ed83-aa9554d100f8/1200214342326.jpg/600x600bb.jpg',
    },
    preview: {
      url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0e/a8/c5/0ea8c58f-d265-e49f-ded1-3a612f391938/mzaf_14710804288394303389.plus.aac.p.m4a',
      duration: 185,
    },
    releaseDate: '2026',
    genre: 'Hip-Hop/Rap',
    duration: 185,
    platforms: {},
    theme: {
      featured: true,
      artistFavorite: true,
      fanFavorite: false,
      trending: true,
      recommended: false,
      latest: true,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#C1121F',
      backgroundGradient: 'radial-gradient(circle at 30% 40%, rgba(193, 18, 31, 0.18) 0%, #050505 100%)',
      particlePreset: 'smoke',
      lightingPreset: 'spotlight',
      transitionStyle: 'blurReveal',
      typographyStyle: 'font-syne tracking-[0.25em] text-[#C1121F] font-bold uppercase',
    }
  },
  {
    id: 'sukuna',
    title: 'SUKUNA',
    artist: '8CTRL',
    album: 'SUKUNA - Single',
    artwork: {
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/44/6a/a5/446aa581-e4e8-df30-97de-e2561fc7e999/1200214051570.jpg/600x600bb.jpg',
    },
    preview: {
      url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/f3/38/54/f33854d5-ece6-f645-8720-5c1c0cc2dedb/mzaf_3127632334349344273.plus.aac.ep.m4a',
      duration: 30,
    },
    releaseDate: '2026',
    genre: 'Hip-Hop/Rap',
    duration: 30,
    platforms: {
      appleMusicUrl: 'https://music.apple.com/us/song/sukuna/6771417507',
    },
    theme: {
      featured: true,
      artistFavorite: false,
      fanFavorite: false,
      trending: true,
      recommended: false,
      latest: true,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#8B0000',
      backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.15) 0%, #050505 85%)',
      particlePreset: 'ash',
      lightingPreset: 'harsh',
      transitionStyle: 'maskReveal',
      typographyStyle: 'font-bebas tracking-widest text-[#8B0000] drop-shadow-[0_0_12px_rgba(139,0,0,0.6)]',
    }
  },
  {
    id: '911',
    title: '911',
    artist: '8CTRL',
    album: '911 - Single',
    artwork: {
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/2d/fa/26/2dfa266f-3954-7f14-6747-deb03f3a51b8/8718521142124.jpg/600x600bb.jpg',
    },
    preview: {
      url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/6b/07/66/6b0766d4-e7d2-f1b2-b297-eeb4d16239ab/mzaf_14915302671166529173.plus.aac.p.m4a',
      duration: 30,
    },
    releaseDate: '2026',
    genre: 'Hip-Hop/Rap',
    duration: 30,
    platforms: {
      appleMusicUrl: 'https://music.apple.com/us/song/911/1893854660',
    },
    theme: {
      featured: false,
      artistFavorite: true,
      fanFavorite: false,
      trending: false,
      recommended: false,
      latest: true,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#C1121F',
      backgroundGradient: 'radial-gradient(circle at 30% 40%, rgba(193, 18, 31, 0.18) 0%, #050505 100%)',
      particlePreset: 'smoke',
      lightingPreset: 'spotlight',
      transitionStyle: 'blurReveal',
      typographyStyle: 'font-syne tracking-[0.25em] text-[#C1121F] font-bold uppercase',
    }
  },
  {
    id: 'pills',
    title: 'Pills',
    artist: '8CTRL',
    album: 'Pills - Single',
    artwork: {
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a3/c1/93/a3c1935c-f2b3-6c6e-d58d-ffada5fcd90f/5026854886381.jpg/600x600bb.jpg',
    },
    preview: {
      url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/84/13/51/84135148-f152-3a15-0329-2ed9ff257788/mzaf_13166730006265304201.plus.aac.ep.m4a',
      duration: 30,
    },
    releaseDate: '2026',
    genre: 'Hip-Hop/Rap',
    duration: 30,
    platforms: {
      appleMusicUrl: 'https://music.apple.com/us/song/pills/1884379145',
    },
    theme: {
      featured: false,
      artistFavorite: false,
      fanFavorite: true,
      trending: true,
      recommended: false,
      latest: false,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#E63946',
      backgroundGradient: 'radial-gradient(circle at 70% 30%, rgba(230, 57, 70, 0.16) 0%, #050505 90%)',
      particlePreset: 'spark',
      lightingPreset: 'spotlight',
      transitionStyle: 'scaleReveal',
      typographyStyle: 'font-bebas tracking-wider text-foreground text-shadow-red',
    }
  },
  {
    id: 'no-melody',
    title: 'No Melody',
    artist: '8CTRL',
    album: 'No Melody - Single',
    artwork: {
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e6/f9/cd/e6f9cd55-f239-e0a9-2b2b-6f917cf6ac9e/5063916059635_cover.jpg/600x600bb.jpg',
    },
    preview: {
      url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8f/c7/a1/8fc7a163-2534-9bb0-65e7-5207bf653cbf/mzaf_18348223822960359509.plus.aac.p.m4a',
      duration: 30,
    },
    releaseDate: '2026',
    genre: 'Hip-Hop/Rap',
    duration: 30,
    platforms: {
      appleMusicUrl: 'https://music.apple.com/us/song/no-melody/1877970225',
    },
    theme: {
      featured: false,
      artistFavorite: false,
      fanFavorite: true,
      trending: false,
      recommended: true,
      latest: false,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#5C0612',
      backgroundGradient: 'radial-gradient(circle at 50% 60%, rgba(92, 6, 18, 0.15) 0%, #050505 100%)',
      particlePreset: 'dust',
      lightingPreset: 'soft',
      transitionStyle: 'fade',
      typographyStyle: 'font-sans font-extrabold uppercase tracking-widest text-[#5C0612]',
    }
  },
  {
    id: 'sesh-in-the-pool',
    title: 'Sesh in the Pool',
    artist: '8CTRL',
    album: 'Sesh in the Pool - Single',
    artwork: {
      url: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/d5/18/97d51833-d7c3-2a4e-e6d1-b670169f2971/5063904214824_cover.jpg/600x600bb.jpg',
    },
    preview: {
      url: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4a/2e/03/4a2e0311-d641-d842-b93c-5a3e195072e7/mzaf_14805979448200592496.plus.aac.p.m4a',
      duration: 30,
    },
    releaseDate: '2026',
    genre: 'Hip-Hop/Rap',
    duration: 30,
    platforms: {
      appleMusicUrl: 'https://music.apple.com/us/song/sesh-in-the-pool/1870312264',
    },
    theme: {
      featured: false,
      artistFavorite: true,
      fanFavorite: false,
      trending: false,
      recommended: true,
      latest: false,
    },
    stats: {},
    visualIdentity: {
      accentColor: '#3A0007',
      backgroundGradient: 'radial-gradient(circle at 50% 50%, rgba(58, 0, 7, 0.12) 0%, #050505 100%)',
      particlePreset: 'noise',
      lightingPreset: 'none',
      transitionStyle: 'slideMask',
      typographyStyle: 'font-syne tracking-[0.4em] text-white/90 font-light',
    }
  }
];
