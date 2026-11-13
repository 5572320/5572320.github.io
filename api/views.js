// 見られた回数を数える Vercel の関数（Upstash Redis の REST API を使う）
// Vercel のダッシュボードで Upstash for Redis をつなぐと，環境変数
// KV_REST_API_URL / KV_REST_API_TOKEN（または UPSTASH_REDIS_REST_URL / _TOKEN）が自動で入る。
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    res.status(503).json({ error: 'counter is not configured' });
    return;
  }
  const command = req.method === 'POST' ? 'incr' : 'get';
  try {
    const r = await fetch(`${url}/${command}/pageviews`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const j = await r.json();
    res.status(200).json({ count: Number(j.result) || 0 });
  } catch (e) {
    res.status(500).json({ error: 'failed' });
  }
};
