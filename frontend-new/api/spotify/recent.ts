interface MinimalRequest { headers?: Record<string, string | string[] | undefined>; }
interface MinimalResponse { status: (code: number) => MinimalResponse; json: (body: unknown) => void; }

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  try {
    const authHeader = req.headers?.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Spotify access token' });
    }
    const accessToken = authHeader.substring('Bearer '.length);

    const recentResp = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=20', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!recentResp.ok) {
      return res.status(recentResp.status).json({ error: 'Failed to fetch recent plays' });
    }
    const data = await recentResp.json();

    return res.status(200).json({ items: data.items ?? [] });
  } catch (err) {
    console.error('Spotify recent error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
