# Arquitetura do TF2Lab

Documentação de alto nível da arquitetura do projeto.

## Princípios

- **Feature First Architecture** — Código organizado por domínio de negócio
- **Convention over Configuration** — Seguir padrões do Nuxt
- **Documentação viva** — Docs são escritos/refinados durante a implementação
- **Simplicidade** — Evitar complexidade desnecessária

## Estrutura de Pastas
tf2lab/
├── features/           # Código por domínio de negócio
│   ├── analytics/
│   ├── competition/
│   ├── player/
│   └── shared/
├── components/
│   └── ui/             # Componentes genéricos (Button, Card, etc.)
├── shared/             # Utilitários, tipos, constantes
├── docs/
│   ├── adr/            # Architectural Decision Records
│   ├── architecture/
│   ├── api/
│   └── product/
├── pages/              # Páginas Nuxt (rotas)
├── layouts/
├── server/             # API routes (Nitro)
├── public/
└── assets/
└── styles/         # Design Tokens + CSS

## Stack Principal

- **Frontend**: Nuxt 4 + Vue 3 + TypeScript
- **UI**: PrimeVue + Design Tokens customizados
- **Estado**: Pinia + TanStack Query
- **Gráficos**: Apache ECharts
- **Deploy**: Vercel

## Decisões Técnicas Importantes

- **Sem `src/`** — Usamos estrutura raiz do Nuxt
- **Feature Flags** — Para liberar módulos gradualmente
- **Layouts** — Preparado para múltiplas páginas (Dashboard, Player, etc.)

Mais detalhes específicos serão adicionados em arquivos dentro de `docs/architecture/` conforme o projeto evolui.