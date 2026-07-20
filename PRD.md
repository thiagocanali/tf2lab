# 📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)

# Projeto

TF2Lab

---

# Visão

Construir a principal plataforma da comunidade competitiva de Team Fortress 2.

Não apenas uma ferramenta de estatísticas.

Mas um ambiente onde jogadores possam aprender, evoluir, competir e colaborar.

---

# Problema

Hoje a comunidade utiliza diversas ferramentas separadas.

* logs.tf
* demos.tf
* trends.tf
* more.tf
* Liquipedia
* Discord

Cada uma resolve apenas parte da necessidade.

Não existe uma plataforma central que integre essas informações.

Além disso:

* novos jogadores têm dificuldade para entrar no competitivo;
* líderes de equipe precisam improvisar planilhas e documentos;
* não existe acompanhamento de evolução do jogador;
* falta conteúdo organizado em português;
* a comunidade brasileira depende de informações espalhadas.

---

# Oportunidade

Criar um hub moderno, gratuito e open source.

O projeto será desenvolvido inicialmente para a comunidade brasileira, mas deverá possuir arquitetura preparada para expansão internacional.

---

# Público

## Jogador Casual

Nunca jogou competitivo.

Quer conhecer.

---

## Jogador Iniciante

Já entrou em alguns mixes.

Quer aprender.

---

## Jogador Competitivo

Quer melhorar.

Quer acompanhar evolução.

---

## Team Leader

Precisa organizar sua equipe.

---

## Coach

Precisa analisar partidas.

---

## Organizador de campeonato

Precisa divulgar informações.

---

# Objetivos

## Objetivo Principal

Ajudar jogadores competitivos a evoluírem.

---

## Objetivos Secundários

Centralizar informações.

Facilitar entrada de novos jogadores.

Fortalecer a comunidade brasileira.

Disponibilizar ferramentas gratuitas.

---

# Não objetivos

O projeto NÃO pretende:

Hospedar demos.

Substituir logs.tf.

Substituir demos.tf.

Substituir trends.tf.

Substituir Liquipedia.

Criar um cliente de jogo.

Criar cheats.

Criar marketplace.

---

# Como o usuário utilizará

Entrará no site.

Pesquisará sua SteamID.

Visualizará estatísticas.

Criará sua equipe.

Criará seu campeonato.

Analisará evolução.

Consumirá conteúdo.

Entrará no Discord.

Encontrará outros jogadores.

---

# Jornada do usuário

Entrar

↓

Pesquisar SteamID

↓

Visualizar Dashboard

↓

Filtrar partidas

↓

Analisar evolução

↓

Entrar na Academy

↓

Entrar na Comunidade

↓

Participar de Mixes

↓

Criar Equipe

↓

Participar de Campeonatos

---

# Funcionalidades Core

Analytics

Dashboard

Gráficos

Filtros

Comparações

Timeline

---

# Funcionalidades Team

Calendário

Scout

Notas

Resultados

Objetivos

Checklist

---

# Funcionalidades Academy

Guias

Vídeos

Glossário

Tutoriais

FAQ

---

# Funcionalidades Community

Discord

Eventos

PUGs

Mixes

Times

Mentores

---

# Funcionalidades Coaching

Replay Review

Metas

Feedback

Treinos

---

# Fontes de dados

logs.tf

demos.tf

more.tf

Steam Web API

Liquipedia (quando permitido)

APIs públicas

---

# Arquitetura

Frontend desacoplado.

API Layer.

Services.

Stores.

UI Components.

Charts.

Pages.

---

# MVP

Pesquisar jogador.

Dashboard.

Filtros.

Gráficos.

Deploy.

---

# Indicadores de sucesso

Quantidade de usuários.

Quantidade de pesquisas.

Quantidade de equipes cadastradas.

Quantidade de campeonatos criados.

Quantidade de acessos à Academy.

Quantidade de mentores.

---

# Princípios

Open Source.

Comunidade primeiro.

Código limpo.

Interface moderna.

Performance.

Acessibilidade.

Responsividade.

---

# Stack

Vue 3

TypeScript

Vite

PrimeVue

Pinia

Vue Router

Apache ECharts

TanStack Query

Vercel

GitHub

GitHub Actions

Neon

---

# Filosofia

Não queremos construir o maior projeto.

Queremos construir o projeto mais útil para a comunidade competitiva de Team Fortress 2.

Cada funcionalidade deverá responder uma pergunta simples:

**Isso ajuda um jogador a evoluir?**

Se a resposta for "sim", ela merece fazer parte do TF2Lab.
