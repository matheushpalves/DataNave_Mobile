# DataNave Mobile

App mobile para arqueólogos em campo catalogarem embarcações tradicionais brasileiras. Estratégia **offline-first** — registros podem ser feitos sem internet e sincronizados depois.

**Backend:** `/home/matheus/Projetos/datanav` (Rails 8.1 API-only, porta 3000)

---

## Tech Stack

- **React Native 0.81** + **Expo 54** (Managed Workflow)
- **Expo Router 6** — file-based routing
- **TypeScript**
- **React Hook Form + Zod** — formulários e validação
- **expo-secure-store** — token JWT e fila offline
- **expo-image-picker** — captura de fotos

---

## Como executar

```bash
npm install
npx expo start
```

Para rodar com o backend local, iniciar o servidor Rails na porta 3000:

```bash
cd /home/matheus/Projetos/datanav
bin/rails server
```

O app detecta automaticamente o IP do host via Expo Go. Certifique-se de que o celular e a máquina estão na mesma rede.

---

## Variáveis de ambiente

Arquivo `.env` na raiz (não commitado):

```
EXPO_PUBLIC_API_URL=https://datanav.onrender.com
```

> Se não definida, o app infere o host pelo Expo Dev Server (útil em desenvolvimento local).

---

## Estrutura de navegação

```
(auth)/       → Login (sem cadastro no mobile — contas criadas na plataforma Web)
(app)/
  (tabs)/
    index         → Home / Menu principal
    cadastro      → Formulário de catalogação de embarcação
    consultas     → Listagem e busca de embarcações
    navegacao     → Navegação
    offline       → Fila de registros pendentes para sincronizar
    perfil        → Dados do arqueólogo e link de suporte
```

---

## Funcionalidade offline

Embarcações cadastradas sem conexão ficam salvas localmente (SecureStore) com status `pending`. A aba **Offline** exibe a fila e permite sincronizar quando houver conexão.

---

## Build para distribuição (EAS)

```bash
eas build --profile preview --platform android
eas build --profile preview --platform ios
```

---

## Documentação detalhada

- [`CLAUDE.md`](./CLAUDE.md) — referência técnica completa (services, autenticação, API, variáveis de ambiente)
- [`ROADMAP_SPRINTS.md`](./ROADMAP_SPRINTS.md) — planejamento de produto por sprints
