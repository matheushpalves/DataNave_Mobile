# DataNave Mobile — CLAUDE.md

Guia de referência rápida para trabalhar neste projeto.

---

## Visão Geral

App mobile do sistema DataNave — cadastro e visualização de embarcações tradicionais brasileiras. Construído com React Native (Expo) usando file-based routing via Expo Router.

**Repositório do backend:** `/home/matheus/Projetos/datanav`
- O backend tem seu próprio `CLAUDE.md` com documentação completa da API, banco de dados e deploy.

---

## Estrutura do Projeto

```
/
├── app/
│   ├── (auth)/            ← Telas de autenticação (login)
│   │   └── _layout.tsx
│   └── (app)/             ← Telas protegidas (requer autenticação)
│       ├── _layout.tsx
│       └── (tabs)/        ← Abas principais do app
│           ├── index.tsx       (Home)
│           ├── cadastro.tsx    (Cadastro de embarcação)
│           ├── consultas.tsx   (Listagem/busca)
│           ├── navegacao.tsx   (Navegação)
│           ├── offline.tsx     (Registros offline pendentes)
│           └── perfil.tsx      (Perfil do usuário)
├── services/
│   ├── auth-service.ts         (login, /auth/me)
│   ├── vessel-service.ts       (CRUD de embarcações)
│   ├── photo-service.ts        (upload de fotos)
│   └── local-vessel-store.ts   (fila offline via SecureStore)
├── contexts/
│   └── auth-context.tsx        (AuthProvider, useAuth, getApiUrl)
├── components/
├── constants/
├── hooks/
└── assets/
```

---

## Tech Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.81.5 | Framework mobile |
| Expo | ~54.0.33 | Toolchain |
| Expo Router | ~6.0.23 | File-based routing |
| TypeScript | ~5.9.2 | Tipagem |
| React Hook Form + Zod | — | Formulários e validação |
| expo-secure-store | ~15.0.7 | Armazenamento seguro (token + offline queue) |
| expo-image-picker | ~17.0.10 | Seleção de fotos |
| React Native Reanimated | ~4.1.1 | Animações |

---

## Autenticação

- **Mecanismo:** JWT próprio do backend Rails (não usa Supabase — diferente do Frontend web)
- **Token:** salvo em `expo-secure-store` com a chave `datanav_auth_token`
- **Contexto:** `AuthProvider` em `contexts/auth-context.tsx` expõe `useAuth()`
- **Proteção de rotas:** separação por grupos de rota `(auth)` e `(app)` no Expo Router
- **Endpoints:**
  - `POST /auth/login` → `{ email, password }` → `{ token, user }`
  - `GET  /auth/me`    → `Bearer <token>` → dados do usuário

---

## Conexão com o Backend

A URL da API é resolvida por `getApiUrl()` em `contexts/auth-context.tsx`:

1. Se `EXPO_PUBLIC_API_URL` estiver definida (variável de ambiente) → usa esse valor
2. Se o app estiver rodando via Expo Go → infere o IP do host de `Constants.expoConfig.hostUri` e usa porta `3000`
3. Fallback: `http://localhost:3000`

**Backend local:** `http://<IP-da-máquina>:3000` (Rails na porta 3000)
**Backend produção:** `https://datanav.onrender.com`

Para rodar em dispositivo físico com Expo Go, o backend precisa estar rodando e o celular na mesma rede.

---

## Funcionalidade Offline

Embarcações podem ser cadastradas sem conexão via `services/local-vessel-store.ts`:

- Armazenadas em `SecureStore` com a chave `datanav_pending_vessels`
- Cada registro tem `local_id`, `sync_status: 'pending' | 'synced' | 'error'`, e fotos em base64
- A aba `offline.tsx` exibe e permite sincronizar os registros pendentes

---

## API — Endpoints Consumidos

```
POST   /auth/login           → login
GET    /auth/me              → usuário atual

GET    /vessels              → lista embarcações (suporta ?q= e ?municipio=)
POST   /vessels              → cria embarcação  { vessel: VesselPayload }
PATCH  /vessels/:id          → atualiza         { vessel: Partial<VesselPayload> }

POST   /photos               → upload foto      { photo: { vessel_id, image_base64 } }
```

Todas as requisições (exceto login) usam `Authorization: Bearer <token>`.

---

## Variáveis de Ambiente

Arquivo `.env` na raiz (não commitado):

```
EXPO_PUBLIC_API_URL=https://datanav.onrender.com   # produção
# Deixar vazio em dev para auto-detectar o IP via Expo
```

---

## Como Rodar

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start           # ou: npx expo start

# Plataformas específicas
npm run android
npm run ios
npm run web
```

Para rodar com o backend local:
```bash
# No diretório do backend
cd /home/matheus/Projetos/datanav
bin/rails server   # porta 3000

# No mobile, deixar EXPO_PUBLIC_API_URL vazio no .env
# O app detecta o IP automaticamente quando usando Expo Go
```

---

## Observações Importantes

1. **JWT próprio** — O mobile usa autenticação JWT do próprio Rails, não o Supabase (que é usado apenas pelo Frontend web).
2. **Fotos em base64** — Imagens são convertidas para base64 antes do upload, consistente com o backend.
3. **Campos em português** — Os campos do modelo `vessel` usam nomes em português (`nome`, `localizacao_municipio`, etc.), igual ao schema do banco.
4. **Offline-first para cadastro** — Cadastros podem ser feitos sem internet e sincronizados depois.
5. **`getApiUrl()` é compartilhado** — Importado de `contexts/auth-context.tsx` por todos os services, não duplicar lógica de URL.
6. **Backend docs** — Para schema do banco, rotas completas, deploy e configuração: consultar `/home/matheus/Projetos/datanav/CLAUDE.md`.
