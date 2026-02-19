export default async function handler(req, res) {
  const { q, limit = 20, sort } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query obrigatória" });
  }

  try {
    let url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;

    if (sort) {
      url += `&sort=${sort}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return res.status(200).json(data.results || []);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
}
