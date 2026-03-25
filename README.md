# LexStudy - Academia Jurídica

Plataforma completa de estudos jurídicos com Inteligência Artificial.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native + Expo (TypeScript) |
| Backend | Node.js + Express (TypeScript) |
| Banco de dados | PostgreSQL 16 |
| Cache | Redis 7 |
| IA | Google Gemini 1.5 |
| Landing Page | Next.js 14 + Tailwind CSS |
| Monorepo | Turborepo + npm workspaces |

---

## Estrutura do Projeto

```
lexstudy/
├── apps/
│   ├── mobile/          # React Native (Expo) — app principal
│   └── web/             # Next.js — landing page
├── backend/             # API Node.js + Express
├── shared/              # Tipos compartilhados + constantes
├── infrastructure/
│   ├── docker-compose.yml
│   ├── postgres/init.sql
│   └── nginx/nginx.conf
├── .env.example
├── turbo.json
└── package.json
```

---

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- Docker e Docker Compose (para PostgreSQL e Redis)
- Expo CLI (`npm install -g expo-cli eas-cli`)

---

## Configuração Inicial

### 1. Clonar e instalar dependências

```bash
# Na raiz do projeto
npm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar o arquivo de exemplo
copy .env.example .env
```

Edite `.env` com seus valores:

```
JWT_ACCESS_SECRET=gere_uma_chave_aleatoria_forte_aqui
JWT_REFRESH_SECRET=gere_outra_chave_aleatoria_forte_aqui
GEMINI_API_KEY=sua_chave_google_gemini_aqui
DATABASE_URL=postgresql://lexstudy:lexstudy_password@localhost:5432/lexstudy_db
REDIS_URL=redis://localhost:6379
```

### 3. Subir banco de dados e Redis

```bash
cd infrastructure
docker-compose up -d postgres redis
```

Aguarde ~10 segundos para o PostgreSQL inicializar e executar o `init.sql`.

---

## Rodando em Desenvolvimento

### Backend

```bash
cd backend
npm run dev
```

API disponível em: `http://localhost:3000`
Health check: `http://localhost:3000/health`

### Mobile (Expo)

```bash
cd apps/mobile

# Android (com dispositivo/emulador)
npm run android

# iOS (somente macOS)
npm run ios

# QR code (Expo Go)
npm start
```

Configure `EXPO_PUBLIC_API_URL` no `.env` com o IP da sua máquina:
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

### Landing Page

```bash
cd apps/web
npm run dev
```

Disponível em: `http://localhost:3001`

---

## Build para Produção

### Backend com Docker

```bash
# Na raiz
docker-compose -f infrastructure/docker-compose.yml --profile production up -d
```

### Mobile — EAS Build

```bash
cd apps/mobile

# Preview (APK para testes)
eas build --platform android --profile preview

# Produção (AAB para Google Play)
eas build --platform android --profile production

# iOS (App Store)
eas build --platform ios --profile production
```

### Landing Page

```bash
cd apps/web
npm run build
npm start
```

---

## Módulos da API

| Rota | Descrição |
|------|-----------|
| `POST /api/auth/register` | Cadastro de usuário |
| `POST /api/auth/login` | Login |
| `POST /api/auth/logout` | Logout |
| `POST /api/auth/refresh` | Renovar tokens |
| `POST /api/auth/forgot-password` | Recuperar senha |
| `GET /api/users/me` | Perfil do usuário |
| `PUT /api/users/me` | Atualizar perfil |
| `DELETE /api/users/me` | Excluir conta (LGPD) |
| `GET /api/users/me/export` | Exportar dados (LGPD) |
| `GET /api/curriculum` | Grade curricular |
| `GET /api/disciplines` | Listagem de disciplinas |
| `GET /api/topics/:disciplineId` | Temas por disciplina |
| `GET /api/lessons/:topicId` | Aulas por tema |
| `POST /api/quiz/start` | Iniciar quiz |
| `POST /api/quiz/submit` | Enviar respostas |
| `GET /api/progress` | Progresso do usuário |
| `GET /api/progress/summary` | Resumo por disciplina |
| `GET /api/gamification/me` | XP e nível |
| `POST /api/lex-ia/chat` | Chat com LEX IA |
| `POST /api/lex-ia/explain` | Explicar conteúdo |
| `POST /api/lex-ia/generate-quiz` | Gerar questões |
| `POST /api/lex-ia/correct-essay` | Corrigir dissertação |
| `POST /api/lex-ia/simulate-exam` | Gerar simulado |
| `POST /api/pdf/upload` | Upload de PDF |
| `GET /api/pdf/:id/summary` | Resumo do PDF |
| `GET /api/pdf/:id/quiz` | Quiz do PDF |
| `GET /api/vade-mecum/search` | Buscar artigos |
| `GET /api/vade-mecum/article` | Artigo específico |
| `GET /api/vade-mecum/favorites` | Artigos favoritos |
| `GET /api/stats/me` | Estatísticas do usuário |
| `GET /api/stats/export-pdf` | Exportar relatório PDF |
| `GET /api/goals` | Metas do usuário |
| `POST /api/goals` | Criar meta |
| `POST /api/consent` | Registrar consentimento LGPD |

---

## Grade Curricular

O app inclui a grade completa de 10 períodos do curso de Direito:

- **1º ao 10º Período** com todas as disciplinas
- Respeito a pré-requisitos entre disciplinas
- Suporte a grade personalizada por instituição
- Marcação de disciplinas EaD

---

## Segurança

- JWT access token (15min) + refresh token (30 dias)
- Senhas com bcrypt (12 rounds)
- Rate limiting por IP e por usuário
- Helmet.js (headers de segurança)
- Variáveis sensíveis apenas via `.env` (nunca no código)
- CORS configurável
- Validação de inputs com Zod

---

## LGPD

- Consentimento explícito no primeiro acesso (privacidade + termos + cookies)
- Exportação de dados pessoais em JSON
- Exclusão de conta com anonimização
- Logs de consentimento com IP e user-agent
- Política de Privacidade e Termos de Uso na landing page
- Tela dedicada de LGPD no perfil do app

---

## Google AdMob

Configure os IDs no `apps/mobile/app.json`:

```json
"react-native-google-mobile-ads": {
  "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
  "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
}
```

E no `.env`:
```
EXPO_PUBLIC_ADMOB_BANNER_ID=ca-app-pub-...
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=ca-app-pub-...
EXPO_PUBLIC_ADMOB_REWARDED_ID=ca-app-pub-...
```

---

## Publicação nas Lojas

### Google Play Store
1. `eas build --platform android --profile production`
2. Download do `.aab` gerado
3. Google Play Console > Create App > Upload Bundle
4. Preencher ficha, screenshots, classificação etária
5. Revisar e publicar

### Apple App Store
1. `eas build --platform ios --profile production`
2. `eas submit --platform ios --profile production`
3. App Store Connect > TestFlight > Produção

---

## Variáveis de Ambiente — Resumo

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL | Sim |
| `REDIS_URL` | Connection string Redis | Sim |
| `JWT_ACCESS_SECRET` | Chave JWT access (min 32 chars) | Sim |
| `JWT_REFRESH_SECRET` | Chave JWT refresh (min 32 chars) | Sim |
| `GEMINI_API_KEY` | Google AI Studio API Key | Sim |
| `SMTP_HOST` | Servidor SMTP (recuperação de senha) | Recomendado |
| `CLOUDINARY_*` | Armazenamento de PDFs na nuvem | Opcional |
| `EXPO_PUBLIC_API_URL` | URL da API para o app mobile | Sim |
| `EXPO_PUBLIC_ADMOB_*` | IDs do Google AdMob | Opcional |

---

## Licença

Propriedade de LexStudy - Academia Jurídica. Todos os direitos reservados.
