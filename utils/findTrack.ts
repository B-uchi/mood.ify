export const searchForTrack = async (query: string) => {
  if (
    !process.env.NEXT_PUBLIC_API_KEY_SECRET ||
    !process.env.NEXT_PUBLIC_WEB_URL
  ) {
    return [
      {
        id: "notfound",
        image: "https://cdn-icons-png.flaticon.com/512/5073/5073941.png",
        name: "Error",
      },
    ];
  }
  const tokenResponse = await fetch("/api/spotify-auth", {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY_SECRET,
    },
  });
  
  const { token } = await tokenResponse.json();

  if (!token) {
    return [
      {
        id: "notfound",
        image: "https://cdn-icons-png.flaticon.com/512/5073/5073941.png",
        name: "Error",
      },
    ];
  }

  let result = [];
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  try {
    const data = await response.json();
    for (let track of data.tracks.items) {
      result.push({
        id: track.id,
        name: track.name,
        image: track.album.images[0].url,
      });
    }
    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return [
      {
        id: "notfound",
        image: "https://cdn-icons-png.flaticon.com/512/5073/5073941.png",
        name: "Not Found",
      },
    ];
  }
};
