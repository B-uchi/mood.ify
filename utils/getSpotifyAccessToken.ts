export const getSpotifyToken = async (): Promise<any> => {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error(
        "Missing Spotify API credentials in environment variables."
      );
    }
  
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });
  
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify token`);
    }
  
    const data = await response.json();
  
    return data;
  };