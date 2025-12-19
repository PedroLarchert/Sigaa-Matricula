# SIGAA Vue - Aplicação de Simulador de Grade e Fluxograma

Transformação da aplicação original HTML/CSS/JS em uma aplicação Vue 3 moderna com TypeScript.

## Estrutura do Projeto

```
src/
├── App.vue                    # Componente raiz
├── main.ts                   # Entrada da aplicação
├── style.css                 # Estilos globais (depreciado, usar styles/main.css)
├── router/
│   └── index.ts              # Configuração de rotas
├── styles/
│   └── main.css              # Estilos consolidados
├── pages/
│   ├── GradeSimulator.vue    # Página do simulador de grade
│   └── FluxoSimulator.vue    # Página do simulador de fluxograma
├── components/
│   ├── HelloWorld.vue        # (a remover)
├── composables/
│   ├── useGradeSimulator.ts  # Lógica reativa da grade
│   └── useFluxoSimulator.ts  # Lógica reativa do fluxograma
└── assets/
```

## Migração Realizada

### De HTML/CSS/JS para Vue 3 + TypeScript

1. **Páginas HTML** → Componentes Vue
   - `js/index.html` → `src/pages/GradeSimulator.vue`
   - `js/fluxo.html` → `src/pages/FluxoSimulator.vue`

2. **Scripts JS** → Composables Vue
   - `js/script.js` → `src/composables/useGradeSimulator.ts`
   - `js/fluxo.js` → `src/composables/useFluxoSimulator.ts`

3. **Estilos CSS** → SCOPED CSS + Global CSS
   - `css/styles.css` → `src/styles/main.css`
   - `css/fluxo.css` → Integrado em `src/styles/main.css`

### Rotas

- `/` - Página do Simulador de Grade
- `/fluxo` - Página do Fluxograma

## Como Executar

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Pré-visualizar build
npm preview
```

## Funcionalidades Implementadas

### Simulador de Grade ✅
- [x] Componente base criado
- [x] Navegação para Fluxo
- [x] Toggle modo claro/escuro
- [ ] Adicionar disciplinas à grade
- [ ] Editar disciplinas
- [ ] Remover disciplinas
- [ ] Parsing de códigos de horário (ex: 24T12)
- [ ] Importar/Exportar grades (QR Code, JSON)
- [ ] Salvar grade como imagem/PDF

### Simulador de Fluxo ✅
- [x] Componente base criado
- [x] Exibição de períodos por curso
- [x] Navegação para Grade
- [x] Toggle modo claro/escuro
- [ ] Interatividade de disciplinas (marcar como passado/cursando/reprovado)
- [ ] Exibir pré-requisitos
- [ ] Importar/Exportar fluxos
- [ ] Animações de conclusão

## Tecnologias Utilizadas

- **Vue 3** - Framework progressive
- **TypeScript** - Type safety
- **Vite** - Build tool rápido
- **Vue Router** - Roteamento
- **CSS Modules & Global CSS** - Estilos

## Próximos Passos

1. Implementar lógica completa de parsing de horários
2. Completar funcionalidade de importar/exportar com QR Code
3. Adicionar modais para edição de disciplinas
4. Implementar interatividade completa do fluxograma
5. Testes unitários com Vitest
6. Deploy em produção

## Variáveis de Ambiente

Adicione em `.env.local` se necessário:

```
VITE_APP_TITLE=SIGAA Simuladores
```

## Contribuindo

1. Faça um fork
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Notas Importantes

- O Node.js 20.14.0 utilizado está abaixo da versão recomendada pelo Vite (20.19+). Considere atualizar.
- Os arquivos HTML originais estão em `/html` e os scripts em `/js` para referência histórica
- A aplicação usa localStorage para persistência de dados
- Font Awesome é usado para ícones (via CDN)

## Autor

Migração e refatoração de aplicação legacy para Vue 3

## Licença

MIT
