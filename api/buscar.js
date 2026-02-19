/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           Compara+ — API Serverless (Vercel)                ║
 * ║  Arquivo: /api/buscar.js                                    ║
 * ║  Endpoint: GET /api/buscar?q=...&limit=...&sort=...         ║
 * ║                                                             ║
 * ║  Como funciona:                                             ║
 * ║  1. O frontend chama /api/buscar com os parâmetros          ║
 * ║  2. Esta função roda no servidor da Vercel (Node.js)        ║
 * ║  3. Ela bate na API do Mercado Livre SEM restrição de CORS  ║
 * ║  4. Retorna os produtos já filtrados e prontos              ║
 * ║                                                             ║
 * ║  Deploy: basta ter este arquivo em /api/buscar.js           ║
 * ║  A Vercel detecta automaticamente e cria o endpoint         ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const AFFILIATE_ID = 'df20251014105211';

export default async function handler(req, res) {

  /* ── CORS: permite qualquer origem ── */
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  /* Preflight OPTIONS */
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  /* ── Parâmetros da query string ── */
  const q     = (req.query.q     || '').trim();
  const limit = parseInt(req.query.limit) || 20;
  const sort  = (req.query.sort  || '').trim();

  /* Validação básica */
  if (!q) {
    return res.status(400).json({ error: true, message: 'Parâmetro "q" é obrigatório.' });
  }

  /* ── Monta URL da API oficial do Mercado Livre ── */
  let mlUrl = `https://api.mercadolibre.com/sites/MLB/search`
    + `?q=${encodeURIComponent(q)}`
    + `&limit=${Math.min(limit, 50)}`; // máx 50 por chamada

  if (sort) mlUrl += `&sort=${encodeURIComponent(sort)}`;

  try {

    /* ── Chama a API do Mercado Livre (server-side = sem CORS) ── */
    const response = await fetch(mlUrl, {
      headers: {
        'Accept':     'application/json',
        'User-Agent': 'ComparaMais/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`ML API retornou status ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.results)) {
      return res.status(200).json([]);
    }

    /* ── Processa e enriquece cada produto ── */
    const products = data.results.map(function(item) {

      /* Adiciona ID de afiliado no permalink */
      let permalink = item.permalink || '';
      if (permalink) {
        try {
          const u = new URL(permalink);
          u.searchParams.set('affiliateId', AFFILIATE_ID);
          permalink = u.toString();
        } catch(e) {
          permalink = permalink + '?affiliateId=' + AFFILIATE_ID;
        }
      }

      /* Thumbnail em alta resolução */
      const thumbnail = (item.thumbnail || '').replace('-I.jpg', '-O.jpg');

      /* Parcelamento */
      const installments = item.installments || null;

      return {
        id:             item.id,
        title:          item.title,
        price:          item.price,
        original_price: item.original_price || null,
        currency_id:    item.currency_id,
        thumbnail:      thumbnail,
        permalink:      permalink,
        condition:      item.condition,
        sold_quantity:  item.sold_quantity || 0,
        available_quantity: item.available_quantity || 0,
        free_shipping:  item.shipping && item.shipping.free_shipping ? true : false,
        installments:   installments,
        seller: {
          id:       item.seller ? item.seller.id   : null,
          nickname: item.seller ? item.seller.nickname : null
        },
        address: {
          state_name: item.address ? item.address.state_name : null,
          city_name:  item.address ? item.address.city_name  : null
        }
      };
    });

    /* ── Retorna array de produtos ── */
    return res.status(200).json(products);

  } catch (err) {

    console.error('[Compara+] Erro ao buscar no ML:', err.message);

    /* Retorna erro estruturado */
    return res.status(500).json({
      error:   true,
      message: 'Falha ao conectar com a API do Mercado Livre.',
      detail:  err.message
    });
  }
}
