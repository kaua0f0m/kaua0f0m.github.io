# Como publicar o site com o blog e o painel

O site fica no repositório **público** `kaua0f0m/kaua0f0m.github.io` e é publicado de graça pelo
**GitHub Pages** em <https://kaua0f0m.github.io>.
O login do painel do blog passa por um **Cloudflare Worker** (gratuito), porque o GitHub Pages não
consegue guardar o segredo do login.

Cada passo abaixo é feito uma vez só. Os passos 1 e 2 eu (Claude) posso fazer por você;
os passos 3 e 4 precisam ser feitos por você, porque envolvem criar contas e chaves.

---

## 1. Repositório e publicação

1. Crie o repositório **público** `kaua0f0m.github.io` e envie todos os arquivos desta pasta.
2. No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

A Action em `.github/workflows/publicar.yml` roda a cada mudança na branch `main`
(inclusive quando você salva um post pelo painel): gera a lista de posts do blog e publica o site.
Leva 1 a 2 minutos. O andamento aparece na aba **Actions** do repositório.

## 2. (opcional) O que não precisa ir para o ar

`designs.html` e `1-terminal.html` … `5-aurora.html` são os 5 designs do começo.
Nada no site aponta para eles, mas num repositório público eles ficam acessíveis pelo endereço.
Dá para apagar ou mover para fora da pasta antes de enviar.

## 3. App de login no GitHub (OAuth App)

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Preencha:
   - **Application name:** Painel do blog
   - **Homepage URL:** `https://kaua0f0m.github.io`
   - **Authorization callback URL:** `https://kaua-cms-auth.SEU-SUBDOMINIO.workers.dev/callback`
     (você vê o endereço exato no passo 4; dá para voltar e corrigir depois)
3. Anote o **Client ID** e gere um **Client secret** (ele só aparece uma vez).

## 4. Servidor de login (Cloudflare Worker)

Crie uma conta gratuita em <https://dash.cloudflare.com>. Depois, na pasta `cms-auth`, no terminal:

```powershell
npx wrangler login
```

```powershell
npx wrangler secret put GITHUB_CLIENT_ID
```

```powershell
npx wrangler secret put GITHUB_CLIENT_SECRET
```

```powershell
npx wrangler deploy
```

O último comando mostra o endereço do Worker (`https://kaua-cms-auth.….workers.dev`).
Coloque esse endereço:

- em `admin/config.yml`, no item `base_url` (o único marcado com **TROCAR**);
- no app do GitHub do passo 3, em **Authorization callback URL** (com `/callback` no fim).

Envie a mudança do `config.yml`. Pronto: abra <https://kaua0f0m.github.io/admin>,
clique em **Entrar com o GitHub** e escreva.

---

## Escrevendo posts

- **Pelo painel:** `/admin` → **Posts → Novo Post**. Título, data, resumo, tags, imagens e texto, com pré-visualização.
  Ao publicar, o post aparece no blog depois que a Action termina (1 a 2 minutos).
- **Rascunho:** marque "Rascunho" para salvar sem aparecer no blog.
- **Sem o painel:** crie um arquivo em `blog/posts/` copiando o formato do post de exemplo,
  direto no site do GitHub ou no seu computador.

## Testar no seu computador

Com o site aberto num servidor local, rode `npx decap-server` na pasta do site e abra `/admin`:
o painel salva direto nos arquivos da pasta, sem login. Para atualizar a lista de posts localmente:
`node scripts/gerar-lista-blog.mjs`.

## Sobre o login

O login pede ao GitHub a permissão `public_repo`: o painel consegue gravar nos seus repositórios
**públicos**, mas não enxerga os privados. O token fica guardado só no seu navegador; o segredo do app
fica só no Worker e nunca vai para o site.
