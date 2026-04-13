# DATANAV Mobile — Roadmap por Sprints

Planejamento consolidado para o app mobile do DATANAV considerando:

- Ecossistema **Expo (Managed Workflow)**
- Backend em **Ruby on Rails** com autenticação JWT
- **Sem criação de conta no mobile** (somente login)
- Público-alvo: **arqueólogos em campo**
- Estratégia técnica principal: **offline-first**

---

## Sprint 1 — Fundação, Segurança e Autenticação

**Objetivo:** configurar a base técnica e garantir acesso seguro ao app.

### Escopo

- Inicialização e padronização do projeto com **Expo + TypeScript**.
- Configuração de distribuição com **EAS** para builds de teste do time de arqueologia.
- Implementação da tela de **Login** baseada no protótipo, sem opção de cadastro.
- Integração com backend Rails para autenticação via JWT:
  - `POST /auth/login`
  - `GET /auth/me`
- Armazenamento seguro do token com `expo-secure-store`.
- Estrutura de navegação com **Expo Router**:
  - stack de autenticação (`(auth)`)
  - área logada com tabs/drawer (`(app)`)

### Critérios de aceite

- Usuário autenticado acessa a área logada sem precisar relogar durante sessão válida.
- Usuário deslogado não acessa rotas protegidas.
- App não exibe fluxo de criação de conta no mobile.
- Build `preview` no EAS instala e abre em dispositivo de teste.

---

## Sprint 2 — Estrutura de Catalogação e Componentes de UI

**Objetivo:** transformar o protótipo em interface mobile robusta para coleta em campo.

### Escopo

- Implementação do **Dashboard/Menu** com ações principais:
  - Cadastro
  - Consultas
  - Configurações
- Construção do formulário de catalogação — **Bloco 1 (Identificação)**:
  - Nome da embarcação
  - Localização (Município/UF)
  - Pontos de atracação
  - Dados do proprietário
- Criação do sistema de design com componentes reutilizáveis:
  - Inputs
  - Botões
  - Cards
- Gerenciamento de formulário com **React Hook Form + Zod** para validações em tempo real.

### Critérios de aceite

- Campos obrigatórios impedem envio incompleto.
- Mensagens de validação são claras e exibidas no contexto do campo.
- Componentes seguem identidade visual aprovada.
- Formulário mantém performance adequada em dispositivos intermediários.

---

## Sprint 3 — Engine Offline e Coleta de Dados Geográficos

**Objetivo:** garantir operação integral sem internet e elevar qualidade dos dados de campo.

### Escopo

- Implementação de persistência local com **Expo SQLite** (offline-first).
- Salvamento local da catalogação completa, incluindo estado de sincronização.
- Captura de geolocalização com `expo-location` no momento da catalogação.
- Construção do formulário de catalogação — **Bloco 2 (Dados Técnicos)**:
  - Ano de construção
  - Mestre construtor
  - Sistema de propulsão
  - Medidas (boca, pontal, comprimento)
- Integração com câmera via `expo-camera` para anexar fotos ao registro local.

### Critérios de aceite

- Registro pode ser salvo em modo avião sem perda de dados.
- Coordenadas geográficas são associadas ao registro quando permissão está ativa.
- Fotos capturadas ficam vinculadas à catalogação local.
- Ao retomar conectividade, registros ficam preparados para sincronização posterior.

---

## Riscos e Mitigações (transversais)

- **Conectividade instável em campo:** persistência local e fila de sincronização como padrão.
- **Permissões do dispositivo (GPS/câmera):** UX de fallback com orientação clara ao usuário.
- **Inconsistência entre payload mobile e API Rails:** contratos versionados e validação de esquema.
- **Dispositivos heterogêneos:** testes recorrentes em aparelhos Android com diferentes recursos.

---

## Indicadores de sucesso do ciclo inicial

- Taxa de sucesso de login em campo.
- Percentual de registros salvos offline sem erro.
- Tempo médio para preencher catalogação.
- Quantidade de registros com GPS e mídia anexada corretamente.
