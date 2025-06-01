# ------------------------------------------------------------------------
# ETAPA 1: “builder” – instala dependências e compila TS (tsup) de todos os workspaces
# ------------------------------------------------------------------------
FROM node:20-alpine AS builder

# 1) Define pasta de trabalho dentro do container
WORKDIR /app

# 2) Copia tudo do repositório para /app dentro do container
#    (inclui pasta ‘apps’, ‘prisma’, ‘pnpm-lock.yaml’, ‘pnpm-workspace.yaml’ etc.)
COPY . .

# 3) Instala todas as dependências do workspace (pnpm)
#    - O `--frozen-lockfile` impede o pnpm de gerar um novo lock
#    - Se precisar forçar a aprovação do postinstall de @prisma/client, adicione: --reporter=append-only
RUN pnpm install --frozen-lockfile

# 4) Roda `prisma generate` ANTES de qualquer build, para garantir o client disponível
#    Ele lerá o schema em /app/prisma/schema.prisma e colocará o @prisma/client em node_modules
RUN pnpm --filter discord-bot --filter @prisma/client prisma:generate

# 5) Compila TODAS as workspaces (no nosso caso, principalmente o discord-bot),
#    executando “turbo run build” (ou “pnpm build” dependendo da sua configuração)
#    Se você usa Turborepo, provavelmente seu root package.json tem "build": "turbo run build"
RUN pnpm build

# ------------------------------------------------------------------------
# ETAPA 2: “runtime” – cria uma imagem enxuta, copiando somente o necessário para rodar o bot em produção
# ------------------------------------------------------------------------
FROM node:20-alpine AS runtime

# 1) Define pasta de trabalho
WORKDIR /app

# 2) Copia o Prisma schema (e eventuais migrations) para dentro da imagem final
COPY prisma ./prisma

# 3) Copia o Prisma Client gerado pelo builder para dentro da imagem final
#    Observe que, por padrão, o pnpm instala em node_modules/.pnpm/.../node_modules/@prisma/client
#    O “builder” já gerou o client em node_modules; portanto basta copiá-lo.
COPY --from=builder /app/node_modules/.pnpm/@prisma+client@* /app/node_modules/.pnpm/@prisma+client@*
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

# 4) Copia o node_modules do bot (discord-bot) para dentro da imagem final.
#    Quando usamos -filter discord-bot no install, ele já põe as deps do bot em node_modules.
COPY --from=builder /app/node_modules /app/node_modules

# 5) Copia a pasta dist/ do discord-bot (código compilado)
COPY --from=builder /app/apps/discord-bot/dist /app/apps/discord-bot/dist

# 6) Copia o package.json do bot, caso alguma dep de runtime precise ser lida
COPY --from=builder /app/apps/discord-bot/package.json /app/apps/discord-bot/package.json

# 7) Define a pasta de trabalho final para o bot
WORKDIR /app/apps/discord-bot

# 8) Define a porta (caso seu bot expositor HTTP; mas, no Discord Bot, normalmente não precisa expor porta)
# EXPOSE 3000

# 9) Comando padrão ao iniciar o container
#    Ele assume que o prisma client já existe em node_modules/@prisma/client
CMD ["node", "dist/index.js"]