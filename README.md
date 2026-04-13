# DATANAV Mobile (Expo)

Aplicativo mobile para arqueólogos em campo com estratégia **offline-first**.

## Sprint 4 entregue

- Módulo de sincronismo com fila local de embarcações pendentes e envio em massa para o backend Rails.
- Tela de cadastro offline para registrar embarcações sem internet.
- Tela de consultas com busca por nome e filtro por município.
- Tela de perfil/configurações com dados do arqueólogo e atalho de recuperação de senha na plataforma Web.
- Fluxo de QA orientado para testes ponta a ponta e checklist de build final via EAS.


## Planejamento de produto (Sprints)

O detalhamento completo do roadmap está em [`ROADMAP_SPRINTS.md`](./ROADMAP_SPRINTS.md).

## Como executar

```bash
npm install
npx expo start
```

## Variáveis de ambiente

Defina a URL do backend Rails:

```bash
EXPO_PUBLIC_API_URL=http://SEU_HOST:3000
```

> Se não for definida, o app tenta inferir automaticamente o host do Expo Dev Server.

## QA ponta a ponta (Sprint 4)

1. Login com usuário válido.
2. Cadastrar embarcação no menu **Campo** (modo offline).
3. Validar pendência em **Sync** e executar **Sincronizar agora**.
4. Confirmar registro no backend (via aba **Consultas** e/ou `/vessels`).
5. Validar tela **Perfil** e link de suporte para recuperação de senha.

## Build para time de arqueologia (EAS)

```bash
eas build --profile preview --platform android
```

ou

```bash
eas build --profile preview --platform ios
```
# DataNave_Mobile
