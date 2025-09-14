🧾 Contexto do projeto

Repositório: https://github.com/lipemarcz/nutriadiet

Visibilidade: Private

Branch ativa: main (migrada de master)

Commit recente: “Versão 1 - Nutria DIET” (contém o app completo)

Nome no package.json (pela build log): nutria-macro@1.0.0

Build target: Vercel

Build Command na Vercel: npm run build

Observação: .gitignore foi atualizado para ignorar **/.env e node_modules/. Alguns .env foram removidos do histórico e .env.example foi restaurado.

🧨 Erro na Vercel

Trecho do log (Linux, Vercel CLI 47.1.1):

Running "vercel build"
Installing dependencies...
added 12 packages in 2s
Running "npm run build"

> nutria-macro@1.0.0 build
> tsc && vite build

sh: line 1: /vercel/path0/node_modules/.bin/tsc: Permission denied
Error: Command "npm run build" exited with 126


Sintoma principal: o script build executa tsc, mas o binário em node_modules/.bin/tsc não é executável (ou nem deveria estar sendo chamado). Isso costuma acontecer por:

typescript ausente ou mal instalado (mas há um .bin/tsc—pode estar corrompido).

Quebra de linha CRLF no bin criado (tsc com \r\n no shebang) → no Linux resulta em “Permission denied”/“node\r not found”.

Permissões de execução do bin no cache do Node/Vercel (falta de +x).

Projeto não precisa de tsc (o build real é do Vite) — mas o script força tsc && vite build.

O detalhe “added 12 packages in 2s” indica que pouquíssimas dependências estão listadas; pode estar faltando declarar typescript, vite e outras no package.json.

✅ Objetivo

Deixar o deploy da Vercel verde. Aceitamos:

build apenas com vite build (typecheck separado), ou

build com tsc && vite build, contanto que o tsc execute corretamente no Linux.

🔎 Tarefas para o codex-cli (checklist)

Inspecionar package.json

Verificar scripts.build (hoje parece ser tsc && vite build).

Confirmar presença de:

"devDependencies": {
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}


Se for React/Vue/etc, conferir plugins (@vitejs/plugin-react, etc).

Normalizar quebras de linha (CRLF → LF)

Criar .gitattributes na raiz:

* text=auto eol=lf


Rodar localmente (ou instruir via PR) para renormalizar:

git add --renormalize .
git commit -m "chore: normalize line endings to LF"


Isso evita o erro clássico de shebang no Linux.

Escolher estratégia de build

Opção A (recomendada se não precisa emitir JS pelo tsc):

"scripts": {
  "build": "vite build",
  "typecheck": "tsc --noEmit",
  "dev": "vite"
}


E garantir typescript e vite nas devDependencies.

Opção B (manter tsc):

Garantir deps e adicionar um prebuild para permissões:

"scripts": {
  "prebuild": "chmod +x node_modules/.bin/tsc || true",
  "build": "tsc && vite build",
  "dev": "vite"
}


Verificar tsconfig.json (incl/exclude corretos).

Node version

Definir engines caso necessário:

"engines": { "node": ">=18" }


(Vercel usa Node 18/20; garantir compatibilidade do Vite/TS).

Vercel config

Se houver vercel.json, checar se não conflita com o comando de build.

Se for monorepo, conferir rootDirectory.

.gitignore

Confirmar que contém:

node_modules/
dist/
.next/
**/.env
**/.env.*
!**/.env.example


Não versionar node_modules.

(Opcional) Fast typecheck no CI

Criar workflow ou script separado typecheck para não travar deploy.

💡 Patches sugeridos (exemplos)
Patch 1 — trocar build para só Vite + typecheck separado
--- a/package.json
+++ b/package.json
@@
 {
   "name": "nutria-macro",
   "version": "1.0.0",
   "private": true,
   "scripts": {
-    "build": "tsc && vite build",
+    "build": "vite build",
+    "typecheck": "tsc --noEmit",
     "dev": "vite"
   },
   "devDependencies": {
-    "typescript": "^5.0.0"
+    "typescript": "^5.4.0",
+    "vite": "^5.2.0"
   }
 }

Patch 2 — manter tsc, garantindo permissão
--- a/package.json
+++ b/package.json
@@
   "scripts": {
-    "build": "tsc && vite build",
+    "prebuild": "chmod +x node_modules/.bin/tsc || true",
+    "build": "tsc && vite build",
     "dev": "vite"
   }

Patch 3 — .gitattributes para LF
* text=auto eol=lf

▶️ Passos de verificação (pós-fix)

npm ci

npm run build (Linux) → deve completar sem “Permission denied”.

Commit + push na main.

Vercel deve reconstruir e publicar sem erros.

Se precisar, o codex-cli pode abrir um PR com:

Ajustes no package.json (scripts e devDependencies),

Adição do .gitattributes,

Conferência do .gitignore,

(Opcional) vercel.json/engines.

Qualquer uma das duas estratégias (A ou B) resolve; eu prefiro a A (vite build + typecheck separado) por ser mais simples e robusta no ambiente da Vercel.