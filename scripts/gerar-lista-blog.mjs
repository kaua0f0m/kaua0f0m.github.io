// Gera blog/posts.json a partir dos arquivos em blog/posts/*.md.
// Roda sozinho na hora de publicar (comando de build) ou à mão: node scripts/gerar-lista-blog.mjs
// Sem dependências: só precisa do Node.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'blog', 'posts');

// lê o bloco "---" do topo do post (o mesmo formato que o painel grava)
function lerCabecalho(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const dados = {};
  if (!m) return dados;
  let chaveLista = null;
  for (const linha of m[1].split(/\r?\n/)) {
    const item = linha.match(/^\s*-\s+(.*)$/);
    if (item && chaveLista) { dados[chaveLista].push(limpar(item[1])); continue; }
    const kv = linha.match(/^([A-Za-zÀ-ÿ_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const [, chave, valor] = kv;
    if (valor === '' ) { dados[chave] = []; chaveLista = chave; continue; }
    chaveLista = null;
    dados[chave] = limpar(valor);
  }
  return dados;
}
function limpar(v) {
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  return v;
}
const lista = v => Array.isArray(v) ? v : (typeof v === 'string' && v ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

const arquivos = (await readdir(pasta)).filter(f => f.endsWith('.md') && !f.startsWith('_'));
const posts = [];
for (const arquivo of arquivos) {
  const c = lerCabecalho(await readFile(join(pasta, arquivo), 'utf8'));
  if (c.rascunho === true) continue;
  posts.push({
    slug: arquivo.replace(/\.md$/, ''),
    arquivo,
    titulo: c.titulo || arquivo.replace(/\.md$/, ''),
    data: String(c.data || '').slice(0, 10),
    resumo: c.resumo || '',
    tags: lista(c.tags),
  });
}
posts.sort((a, b) => b.data.localeCompare(a.data) || a.slug.localeCompare(b.slug));
await writeFile(join(raiz, 'blog', 'posts.json'), JSON.stringify(posts, null, 2) + '\n');
console.log(`blog/posts.json: ${posts.length} post(s)`);
