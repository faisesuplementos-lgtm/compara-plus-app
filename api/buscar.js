export default async function handler(req, res) {
  const { q, limit = 20 } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  const url = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const products = (data.results || []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      thumbnail: item.thumbnail,
      permalink: item.permalink
    }));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");

    return res.status(200).json(products);

  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

