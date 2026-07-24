# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Estrutura inicial do projeto (Nuxt 4 + TypeScript)
- Configuração básica de PrimeVue e Pinia

### Changed
- **Migração para Nuxt 4 app directory**: rotas movidas de `pages/` para `app/pages/`
  - `/log/[id]` → `app/pages/log/[id].vue`
  - `/player/[id]` → `app/pages/player/[id].vue`
- Imports corrigidos para usar alias `~~/` (compatibilidade Nuxt 4)
- Endpoint `/api/log/[id]`: adicionado mock determinístico como fallback
- Empty states e skeleton loaders melhorados nas páginas Log/Player

### Fixed
- Navegação Search → Log → Player funcionando corretamente
- Imports quebrados em componentes (`~/` → `~~/`)
- Removidos arquivos órfãos em `pages/` (academy, competition, player/index)

---

## [0.1.0] - 2026-07-20

### Added
- Bootstrap do repositório
- README inicial
- Estrutura de pastas (features-first)
- Primeiro commit histórico