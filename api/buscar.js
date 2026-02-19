export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Digite algo para buscar" });
  }

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(q)}&limit=10`
    );

    const data = await response.json();

    const produtos = data.results.map((item) => ({
      titulo: item.title,
      preco: item.price,
      link: item.permalink,
      imagem: item.thumbnail
    }));

    res.status(200).json(produtos);

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar no Mercado Livre" });
  }
}
