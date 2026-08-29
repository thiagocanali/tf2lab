# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **K/D trend chart**: TF2-themed card (red/orange), readable dark tooltips, reactive series from real logs, chronological axis, empty state when there is no data

### Added
- **Página de busca melhorada (`/search`)**:
  - Detecção automática de tipo de query: SteamID64, player name, log ID
  - Priorização de resultados de jogadores (cards com avatar, nome, stats)
  - Agregação de stats do jogador (kills, deaths, K/D, damage, matches) via logs.tf API
  - Grid responsivo de player cards com links para `/player/[steamId]`
  - Loading skeletons específicos para player cards
  - Empty states inteligentes com sugestões contextuais
  - Badge "Exact match" para buscas por SteamID64

### Changed
- **Migração para Nuxt 4 app directory**: rotas movidas de `pages/` para `app/pages/`
  - `/log/[id]` → `app/pages/log/[id].vue`
  - `/player/[id]` → `app/pages/player/[id].vue`
- Imports corrigidos para usar alias `~~/` (compatibilidade Nuxt 4)
- Endpoint `/api/log/[id]`: adicionado mock determinístico como fallback
- Empty states e skeleton loaders melhorados nas páginas Log/Player
- **Busca refatorada**: backend usa endpoints corretos da logs.tf API (`?player=`, `?title=`, `?id=`)
- Headline da busca: "Find players & logs" (foco no jogador)
- **Página de Log (`/log/[id]`) redesenhada**:
  - `LogHeader.vue`: novo layout com eyebrow (`Log #ID` + map pill), título hierárquico, meta list (data, duração, jogadores) e scoreboard Red vs Blu com vencedor destacado e label "RED/BLU victory"
  - `LogPlayersTable.vue`: tabela semântica com colunas Player, Team, K, D, A, K/D, DMG, DPM; ranking numérico, link para `/player/[steamId]`, team pills, cores de K/D (forte/ok/fraco), zebra striping, hover, empty state visual
  - `LogStatsGrid.vue`: card "Match at a glance" com Players, Duration, Total kills, Total damage (sem redundância de Red/Blu)
  - Página `/log/[id]`: skeleton mais rico (header + tabela) e empty state mantido
  - Tema TF2 reforçado: gradientes vermelho/azul no header, cores semânticas, hover states, transições suaves
  - Backend: `timestamp` agora `null` (em vez de `undefined`) quando ausente; `title` faz trim; `map` retornado como `null` para exibição de "—"; scores usam `-1` como sentinela para "não disponível" (em vez de `0` mascarado)

### Fixed
- Navegação Search → Log → Player funcionando corretamente
- Imports quebrados em componentes (`~/` → `~~/`)
- Removidos arquivos órfãos em `pages/` (academy, competition, player/index)
- Backend search: tratamento correto de respostas da API logs.tf (array vs object)
- Busca por nome: não falha mais quando API não retorna players
- Página de Log: valores vazios (data, mapa, duração) exibidos como "—" em vez de string em branco

---

## [0.1.0] - 2026-07-20

### Added
- Bootstrap do repositório
- README inicial
- Estrutura de pastas (features-first)
- Primeiro commit histórico