# Construction Inspection Portal

Sistema web para gerenciamento de inspeção de obras com análise automática de evidências fotográficas usando IA.

## 🚀 Funcionalidades

### Implementadas (MVP)

- ✅ **Autenticação**: Login com email/senha, gerenciamento de sessão
- ✅ **Dashboard**: Resumo geral de projetos, evidências analisadas e problemas detectados
- ✅ **Gerenciamento de Projetos**: CRUD completo de projetos de inspeção
- ✅ **Upload de Evidências**: Upload de fotos com validação (JPEG/PNG/WEBP, até 10MB)
- ✅ **Análise Automática**: Trigger e polling de análise de evidências com IA
- ✅ **Detecção de Problemas**: Exibição de issues detectadas com confiança e severidade
- ✅ **Relatórios**: Geração de relatórios em PDF/HTML com download

## 🛠️ Tecnologias

- **Next.js 15.5.5** - React framework com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Styling
- **ESLint** - Code quality

## 📋 Pré-requisitos

- Node.js 18+ ou superior
- npm, pnpm, ou yarn
- Git

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone <repository-url>
cd my-app
```

### 2. Instale as dependências

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_USE_MOCK_API=true
```

**Variáveis disponíveis:**

- `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend
- `NEXT_PUBLIC_USE_MOCK_API`: Se `true`, usa dados mock; se `false`, conecta à API real

### 4. Execute o servidor de desenvolvimento

```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🧪 Modo Mock

Por padrão, o sistema opera em **modo mock** (sem backend real):

- Login aceita qualquer email/senha
- Dados simulados para projetos, evidências e relatórios
- Ideal para desenvolvimento e demonstrações

### Credenciais de Teste (Modo Mock)

- **Email**: qualquer email válido
- **Senha**: qualquer senha (mínimo 8 caracteres)

## 🏗️ Build de Produção

```bash
# Build
npm run build

# Start servidor de produção
npm run start
```

## 📁 Estrutura do Projeto

```
my-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── login/              # Login page
│   │   ├── projects/           # Projects pages
│   │   │   └── [projectId]/    # Project detail & evidences
│   │   └── reports/            # Reports pages
│   ├── components/             # React components
│   │   ├── evidence/           # Evidence-related components
│   │   ├── issues/             # Issues display components
│   │   └── projects/           # Project components
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useEvidence.ts      # Evidence data hook
│   │   ├── useProjects.ts      # Projects data hook
│   │   ├── useAnalysis.ts      # Analysis triggering/polling
│   │   └── usePolling.ts       # Generic polling hook
│   ├── lib/
│   │   └── api/                # API module
│   │       ├── client.ts       # HTTP client
│   │       ├── config.ts       # API configuration
│   │       ├── endpoints.ts    # API endpoints
│   │       ├── mock-data.ts    # Mock data
│   │       └── types.ts        # TypeScript types
│   └── utils/                  # Utility functions
│       ├── auth.ts             # Auth utilities
│       ├── errors.ts           # Error handling
│       └── formatting.ts       # Formatters
├── public/                     # Static assets
├── .env.local                  # Environment variables (não commitado)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

## 🔌 Integração com Backend Real

Para conectar a uma API real:

1. **Configure a URL da API** em `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://sua-api.com/api
   NEXT_PUBLIC_USE_MOCK_API=false
   ```

2. **Contratos da API** estão documentados em:
   - `specs/001-construction-inspection-portal/contracts/api-contracts.md`
   - `src/lib/api/types.ts` (TypeScript definitions)

3. **Endpoints esperados**:
   - `POST /auth/login`
   - `GET /dashboard/summary`
   - `GET /projects`, `POST /projects`, `GET /projects/:id`
   - `GET /projects/:id/evidences`, `POST /projects/:id/evidences`
   - `GET /evidences/:id`, `POST /evidences/:id/analyze`
   - `POST /projects/:id/reports/generate`, `GET /projects/:id/reports/latest`

## 🎨 Tema e Branding

O sistema usa as cores institucionais do Metro-SP:

- **Azul Primário**: `#001489` (Prefeitura de São Paulo)
- **Azul Escuro**: `#003366`
- Cores de status: Verde (sucesso), Amarelo (processando), Vermelho (erro)

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Start produção
npm run lint         # Lint código
```

## 🐛 Troubleshooting

### Erro: "Cannot find module 'react'"

Isso é um erro do language server do TypeScript, não afeta a execução:

```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Modo Mock não funciona

Verifique se `.env.local` tem:
```env
NEXT_PUBLIC_USE_MOCK_API=true
```

### Imagens não carregam

No modo mock, as URLs de imagem são da Unsplash. Verifique sua conexão com internet.

## 📚 Documentação Adicional

- **Especificação Completa**: `specs/001-construction-inspection-portal/spec.md`
- **Plano de Implementação**: `specs/001-construction-inspection-portal/plan.md`
- **Contratos da API**: `specs/001-construction-inspection-portal/contracts/api-contracts.md`
- **Modelo de Dados**: `specs/001-construction-inspection-portal/data-model.md`

## 🔐 Segurança

- Tokens de autenticação armazenados em `localStorage`
- Headers `Authorization: Bearer <token>` em todas as requisições autenticadas
- Validação de tipos de arquivo no upload (JPEG/PNG/WEBP apenas)
- Limite de 10MB por arquivo

## 🚀 Próximos Passos (Pós-MVP)

- [ ] Filtros avançados na listagem de projetos
- [ ] Anotações e marcações nas imagens de evidência
- [ ] Notificações em tempo real
- [ ] Exportação de relatórios em múltiplos formatos
- [ ] Histórico de versões de projetos
- [ ] Permissões granulares por usuário

## 📄 Licença

Este é um projeto acadêmico desenvolvido para fins educacionais.

## 👥 Contribuidores

Desenvolvido como parte do Projeto Integrador II.

---

**Status**: ✅ MVP Completo (102/102 tasks)
