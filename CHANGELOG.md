# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Fixed
- Navegação Search → Log → Player funcionando corretamente
- Imports quebrados em componentes (`~/` → `~~/`)
- Removidos arquivos órfãos em `pages/` (academy, competition, player/index)
- Backend search: tratamento correto de respostas da API logs.tf (array vs object)
- Busca por nome: não falha mais quando API não retorna players

---

## [0.1.0] - 2026-07-20

### Added
- Bootstrap do repositório
- README inicial
- Estrutura de pastas (features-first)
- Primeiro commit histórico