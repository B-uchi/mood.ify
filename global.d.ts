export {};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any; // Optional: You can type Spotify more accurately if you prefer
  }
}