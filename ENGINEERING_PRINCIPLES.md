# Engineering Principles

> "Long-term maintainability is more important than short-term speed."

---

## 1. Simplicidade primeiro

Sempre escolher a solução mais simples que resolva o problema.

---

## 2. Não fazer overengineering

Nenhuma feature será criada pensando em uma necessidade hipotética.

---

## 3. Código legível vence código inteligente

Qualquer desenvolvedor deve conseguir entender o projeto.

---

## 4. Componentes pequenos

Cada componente deve fazer apenas uma coisa.

---

## 5. Funções pequenas

Idealmente menos de 30 linhas.

---

## 6. Separação de responsabilidades

UI

↓

Services

↓

API

↓

Business Rules

↓

Types

Nunca misturar.

---

## 7. Nunca consumir APIs diretamente dentro dos componentes

Sempre utilizar Services.

---

## 8. Nunca duplicar código

Criar composables.

Criar utilities.

Criar componentes reutilizáveis.

---

## 9. Performance é uma feature

Evitar chamadas desnecessárias.

Cache sempre que possível.

Lazy Loading.

Code Splitting.

---

## 10. UX acima da tecnologia

O usuário nunca deve perceber a complexidade do sistema.