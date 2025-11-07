// Vercel function to proxy Spotify profile requests using a Bearer token from the client
interface MinimalRequest { headers?: Record<string, string | string[] | undefined>; }
interface MinimalResponse { status: (code: number) => MinimalResponse; json: (body: unknown) => void; }

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  try {
    const authHeader = req.headers?.authorization as string | undefined;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Spotify access token' });
    }
    const accessToken = authHeader.substring('Bearer '.length);

    const profileResp = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileResp.ok) {
      return res.status(profileResp.status).json({ error: 'Failed to fetch Spotify profile' });
    }
    const profile = await profileResp.json();

    return res.status(200).json({ profile });
  } catch (err) {
    console.error('Spotify profile error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
