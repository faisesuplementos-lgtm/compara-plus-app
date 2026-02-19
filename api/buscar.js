export default async function handler(req, res) {

  const { q, limit, sort } = req.query;

  if (!q) {
    res.status(400).json({ error: "Parâmetro 'q' é obrigatório" });
    return;
  }

  const searchLimit = limit || 20;
  const searchSort = sort || "price_asc";

  const url = "https://api.mercadolibre.com/sites/MLB/search?q=" +
    encodeURIComponent(q) +
    "&limit=" + searchLimit +
    "&sort=" + searchSort;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      res.status(500).json({ error: "Erro ao buscar na API do Mercado Livre" });
      return;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      res.status(200).json([]);
      return;
    }

    const products = data.results.map(function(item) {
      return {
        title: item.title || "Produto",
        price: item.price || 0,
        original_price: item.original_price || 0,
        thumbnail: item.thumbnail || "",
        permalink: item.permalink || "",
        installments: item.installments || null,
        condition: item.condition || "",
        shipping: item.shipping || null
      };
    });

    res.status(200).json(products);

  } catch (err) {
    res.status(500).json({ error: "Falha na conexão com o Mercado Livre" });
  }
}

