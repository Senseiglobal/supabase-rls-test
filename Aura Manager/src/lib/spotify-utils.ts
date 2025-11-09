// Spotify integration utilities for Aura Manager

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private", 
  "user-read-recently-played",
  "playlist-read-private",
  "user-top-read",
  "user-read-playback-state",
  "user-read-currently-playing"
].join(" ");

export const SPOTIFY_CONFIG = {
  scopes: SPOTIFY_SCOPES,
  showDialog: false, // Set to true to always show Spotify auth dialog
};

export const getSpotifyRedirectUrl = (baseUrl?: string) => {
  const base = baseUrl || (globalThis.location?.origin ?? "https://auramanager.app");
  return `${base}/account?connected=spotify`;
};

export const handleSpotifyError = (error: any) => {
  if (error.message.includes('invalid_client') || error.message.includes('invalid redirect')) {
    return {
      title: "🎵 Spotify connection setup issue",
      description: "Our team is working on this. Please try again later."
    };
  } else if (error.message.includes('unauthorized_client')) {
    return {
      title: "🎵 Spotify app configuration needed", 
      description: "Please contact support to enable Spotify integration."
    };
  } else if (error.message.includes('access_denied')) {
    return {
      title: "🎵 Connection cancelled",
      description: "You chose not to connect Spotify. You can try again anytime."
    };
  } else {
    return {
      title: "🎵 Connection failed",
      description: "Something went wrong. Please try again in a moment."
    };
  }
};