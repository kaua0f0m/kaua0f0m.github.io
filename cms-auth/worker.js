// Servidor de login do painel do blog (Decap CMS + GitHub), para rodar como Cloudflare Worker.
//
// Fluxo: o painel abre /auth numa janelinha -> o GitHub pede autorização -> volta em /callback ->
// este Worker troca o "code" por um token (usando o segredo, que nunca vai para o navegador) ->
// a janelinha entrega o token ao painel e fecha.
//
// Configuração (veja PUBLICAR.md):
//   segredos:  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET   (npx wrangler secret put ...)
//   variáveis: ALLOWED_ORIGINS  = endereços do site que podem usar o login, separados por vírgula
//              SCOPE            = permissão pedida ao GitHub (padrão: public_repo)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const github = new URL('https://github.com/login/oauth/authorize');
      github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      github.searchParams.set('redirect_uri', `${url.origin}/callback`);
      // repositório público só precisa de 'public_repo'; para privado, defina SCOPE = "repo"
      github.searchParams.set('scope', env.SCOPE || 'public_repo');
      github.searchParams.set('state', state);
      return new Response(null, {
        status: 302,
        headers: {
          Location: github.toString(),
          'Set-Cookie': `cms_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const cookie = (request.headers.get('Cookie') || '').match(/(?:^|;\s*)cms_state=([^;]+)/);
      if (!code || !state || !cookie || cookie[1] !== state) {
        return reply(env, 'error', { message: 'Login expirou ou veio de outro lugar. Tente de novo.' });
      }
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'cms-auth-worker' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/callback`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.access_token) {
        return reply(env, 'error', { message: data.error_description || 'O GitHub recusou o login.' });
      }
      return reply(env, 'success', { token: data.access_token, provider: 'github' });
    }

    return new Response('Servidor de login do painel do blog. Nada para ver aqui.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};

// Página da janelinha: conversa com o painel pelo protocolo do Decap CMS
// ("authorizing:github" -> resposta do painel -> "authorization:github:<status>:<json>").
function reply(env, status, content) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const js = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
  const html = `<!doctype html><meta charset="utf-8"><title>Login</title>
<p style="font:16px system-ui;padding:24px">${status === 'success' ? 'Pronto, pode fechar esta janela.' : 'Não deu certo. Feche esta janela e tente de novo.'}</p>
<script>
(function () {
  var allowed = ${js(allowed)};
  var message = ${js(message)};
  function ok(origin) { return allowed.length === 0 || allowed.indexOf(origin) !== -1; }
  function receive(e) {
    if (!ok(e.origin)) return;
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receive);
    setTimeout(function () { window.close(); }, 300);
  }
  window.addEventListener('message', receive);
  if (window.opener) {
    allowed.length ? allowed.forEach(function (o) { window.opener.postMessage('authorizing:github', o); })
                   : window.opener.postMessage('authorizing:github', '*');
  }
})();
</script>`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
