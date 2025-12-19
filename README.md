# Vue 3 + TypeScript + Vite


# SIGAA Simuladores - Aplicação Vue 3

Aplicação Vue 3 moderna com TypeScript para simulação de grades horária e fluxograma curricular do sistema SIGAA.

## Funcionalidades

- **Simulador de Grade Horária**: Gerencie disciplinas em uma grade horária visual
- **Simulador de Fluxograma**: Acompanhe sua progressão no currículo
- **Modo Claro/Escuro**: Interface responsiva com tema claro e escuro
- **Sincronização Local**: Dados salvos em localStorage
- **Exportação**: QR Codes e exportação JSON

## Primeiros Passos

```bash
npm install
npm run dev
```

## Stack Tecnológico

- **Vue 3** com Composition API
- **TypeScript** para segurança de tipos
- **Vite** para build rápido
- **Vue Router** para navegação
- **Responsive CSS** com suporte a modo escuro

## Estrutura do Projeto

```
src/
├── pages/          # Páginas da aplicação
├── composables/    # Lógica compartilhada
├── styles/         # Estilos globais
├── router/         # Configuração de rotas
└── App.vue         # Componente raiz
```

Ver [MIGRATION.md](./MIGRATION.md) para detalhes da migração do HTML/CSS/JS para Vue.
