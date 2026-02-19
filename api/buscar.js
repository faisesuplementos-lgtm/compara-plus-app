const AFFILIATE_ID = 'df20251014105211';

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const q = (req.query && req.query.q) ? req.query.q.trim() : '';
  const limit = (req.query && req.query.limit) ? Math.min(parseInt(req.query.limit) || 20, 50) : 20;
  const sort = (req.query && req.query.sort) ? req.query.sort.trim() : '';

  if (!q) {
    return res.status(400).json({ error: true, message: "Parametro 'q' e obrigatorio" });
  }

  var url = 'https://api.mercadolibre.com/sites/MLB/search'
    + '?q=' + encodeURIComponent(q)
    + '&limit=' + limit;

  if (sort) url += '&sort=' + encodeURIComponent(sort);

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'ComparaMais/1.0' }
    });

    if (!response.ok) {
      return res.status(200).json([]);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return res.status(200).json([]);
    }

    const products = data.results.map(function(item) {

      var permalink = item.permalink || '';
      if (permalink) {
        try {
          var u = new URL(permalink);
          u.searchParams.set('affiliateId', AFFILIATE_ID);
          permalink = u.toString();
        } catch(e) {
          permalink = permalink + '?affiliateId=' + AFFILIATE_ID;
        }
      }

      var thumbnail = (item.thumbnail || '').replace('-I.jpg', '-O.jpg');

      return {
        id:             item.id             || '',
        title:          item.title          || '',
        price:          item.price          || 0,
        original_price: item.original_price || null,
        thumbnail:      thumbnail,
        permalink:      permalink,
        condition:      item.condition      || '',
        sold_quantity:  item.sold_quantity   || 0,
        free_shipping:  !!(item.shipping && item.shipping.free_shipping),
        installments:   item.installments   || null,
        seller: {
          nickname: item.seller ? item.seller.nickname : null
        },
        address: {
          state_name: item.address ? item.address.state_name : null
        }
      };
    });

    return res.status(200).json(products);

  } catch (err) {
    console.error('[Compara+] Erro:', err.message);
    return res.status(200).json([]);
  }
};

