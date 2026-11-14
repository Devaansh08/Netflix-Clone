/**
 * @file streamConfig.js
 * @description Catalog of verified, legal Creative Commons (CC) open-source HLS video streams.
 * 
 * WHY THIS MATTERS FOR INTERVIEWS & RECRUITER AUDITS:
 * 1. Ethical & Legal Compliance:
 *    Recruiters actively inspect portfolio clones. Using pirated m3u8 streams or illegal IPTV playlists
 *    disqualifies candidates immediately.
 * 2. Real Adaptive Bitrate HLS (.m3u8):
 *    These streams are authentic multi-bitrate HLS streams developed by the Blender Open Movie Foundation
 *    and hosted on public test CDNs (Bitmovin / Fastly / Cloudflare / Mux), serving genuine 1080p, 720p, and 480p chunks.
 */

export const DEMO_STREAMS = {
  // Big Buck Bunny (Blender Foundation - Creative Commons 3.0)
  default: {
    title: 'Big Buck Bunny (Blender Open Movie)',
    streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    isDemo: true
  },
  // Sintel (Blender Foundation - Creative Commons 3.0)
  sintel: {
    title: 'Sintel (Blender Open Movie)',
    streamUrl: 'https://bitmovin-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
    isDemo: true
  },
  // Tears of Steel (Blender VFX Open Movie)
  tearsOfSteel: {
    title: 'Tears of Steel (Blender Open Movie)',
    streamUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    isDemo: true
  }
};

/**
 * Resolves the appropriate HLS stream URL for a given movie.
 * Maps known TMDB IDs or falls back gracefully to a verified CC open movie stream.
 */
export const getStreamForMovie = (movieId) => {
  const numericId = Number(movieId);
  if (numericId === 27205) {
    return DEMO_STREAMS.sintel;
  }
  if (numericId === 157336) {
    return DEMO_STREAMS.tearsOfSteel;
  }
  return DEMO_STREAMS.default;
};

export default DEMO_STREAMS;
