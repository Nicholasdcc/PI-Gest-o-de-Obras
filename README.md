# 🏗️ PI - Gestão de Obras

Sistema completo de gestão e fiscalização de obras com análise inteligente de arquivos BIM e imagens utilizando Inteligência Artificial.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API](#api)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Testes](#testes)
- [Docker](#docker)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **PI - Gestão de Obras** é uma plataforma web desenvolvida para auxiliar na gestão e fiscalização de obras de infraestrutura, com foco especial em projetos do Metrô de São Paulo. O sistema utiliza Inteligência Artificial (OpenAI) para realizar análises automáticas de arquivos BIM (Building Information Modeling) e imagens de obras, comparando-os para identificar discrepâncias, problemas e o progresso da construção.

### Objetivos

- **Automatizar a análise** de arquivos BIM e imagens de obras
- **Identificar problemas** e não conformidades automaticamente
- **Comparar** o estado real da obra (imagens) com o projeto BIM
- **Gerar relatórios** detalhados de fiscalização
- **Centralizar** a gestão de múltiplos projetos de obras

## ✨ Funcionalidades

### 🏢 Gestão de Projetos

- Criação e gerenciamento de projetos de obras
- Visualização de lista de projetos com filtros e busca
- Dashboard com estatísticas gerais
- Status de projetos (ativo, pausado, concluído, arquivado)

### 📸 Gestão de Evidências

- Upload de imagens de obras
- Análise automática de imagens usando IA
- Identificação de problemas e não conformidades
- Classificação por severidade (baixa, média, alta, crítica)
- Histórico de evidências por projeto

### 🏗️ Análise BIM

- Upload de arquivos IFC (Industry Foundation Classes)
- Análise automática de modelos BIM
- Extração de elementos e propriedades
- Validação de conformidade com normas

### 🔍 Comparação Inteligente

- Comparação automática entre modelo BIM e imagens reais
- Cálculo de similaridade e porcentagem de conclusão
- Identificação de discrepâncias
- Relatórios de divergências

### 📊 Relatórios

- Geração de relatórios em PDF e HTML
- Consolidação de análises e problemas detectados
- Histórico de relatórios por projeto

### 🔐 Autenticação

- Sistema de login seguro
- Gerenciamento de sessão
- Proteção de rotas

## 🛠️ Tecnologias

### Backend

- **Python 3.11+** - Linguagem principal
- **FastAPI** - Framework web assíncrono
- **SQLAlchemy 2.0** - ORM para banco de dados
- **Alembic** - Migrações de banco de dados
- **MySQL 8.4** - Banco de dados relacional
- **OpenAI API** - Serviço de IA para análises
- **Pydantic** - Validação de dados
- **Uvicorn** - Servidor ASGI
- **Docker** - Containerização

### Frontend

- **Next.js 15.5.5** - Framework React com App Router
- **React 19.1.0** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Material-UI (MUI) 7.3.5** - Componentes de interface
- **Tailwind CSS 4** - Estilização utilitária
- **Motion (Framer Motion) 12.23.24** - Animações

### Ferramentas de Desenvolvimento

- **ESLint** - Linter JavaScript/TypeScript
- **Ruff** - Linter Python
- **Pytest** - Framework de testes Python
- **Docker Compose** - Orquestração de containers

## 🏛️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**, organizando o código em camadas bem definidas:

### Backend

```
back-end/
├── app/
│   ├── core/           # Configurações centrais
│   ├── domain/          # Entidades e regras de negócio
│   │   ├── entities/   # Entidades de domínio
│   │   └── repositories/ # Interfaces de repositórios
│   ├── infrastructure/  # Implementações técnicas
│   │   ├── db/         # Banco de dados e repositórios
│   │   └── services/   # Serviços externos (OpenAI, Storage)
│   ├── interfaces/     # Camada de apresentação
│   │   └── http/       # API REST
│   ├── use_cases/      # Casos de uso da aplicação
│   └── main.py         # Ponto de entrada
├── alembic/            # Migrações de banco de dados
└── tests/              # Testes automatizados
```

### Frontend

```
front-end/
├── src/
│   ├── app/            # Rotas Next.js (App Router)
│   │   ├── (dashboard)/ # Rotas protegidas
│   │   └── login/      # Página de login
│   ├── components/     # Componentes React reutilizáveis
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Bibliotecas e utilitários
│   │   └── api/        # Cliente API e tipos
│   └── utils/          # Funções utilitárias
└── public/             # Arquivos estáticos
```

### Fluxo de Dados

1. **Frontend** → Requisição HTTP → **Backend API**
2. **API** → Validação (Pydantic) → **Use Case**
3. **Use Case** → **Repository** → **Database**
4. **Use Case** → **OpenAI Service** → Análise IA
5. **Use Case** → Retorna resultado → **API** → **Frontend**

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 20+ e **npm/pnpm**
- **Python** 3.11 ou superior
- **Docker** e **Docker Compose** (recomendado)
- **MySQL** 8.4 (se não usar Docker)
- **Git**

## 🚀 Instalação

### Opção 1: Usando Docker (Recomendado)

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd PI-Gest-o-de-Obras
```

2. **Configure as variáveis de ambiente:**

Crie um arquivo `.env` na raiz do projeto `back-end/`:

```env
APP_ENVIRONMENT=development
APP_API_V1_PREFIX=/api/v1
APP_MYSQL_USER=metro
APP_MYSQL_PASSWORD=metro
APP_MYSQL_HOST=mysql
APP_MYSQL_PORT=3306
APP_MYSQL_DB=metro_bim
APP_UPLOADS_DIR=storage/uploads
OPENAI_API_KEY=sua-chave-openai-aqui
```

3. **Inicie os containers:**
```bash
cd back-end
docker-compose up -d
```

4. **Execute as migrações:**
```bash
docker-compose exec api alembic upgrade head
```

5. **Instale as dependências do frontend:**
```bash
cd ../front-end
npm install
# ou
pnpm install
```

6. **Inicie o frontend:**
```bash
npm run dev
# ou
pnpm dev
```

### Opção 2: Instalação Manual

#### Backend

1. **Crie um ambiente virtual:**
```bash
cd back-end
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. **Instale as dependências:**
```bash
pip install -e .[dev]
```

3. **Configure o banco de dados MySQL** e atualize o `.env`

4. **Execute as migrações:**
```bash
alembic upgrade head
```

5. **Inicie o servidor:**
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. **Instale as dependências:**
```bash
cd front-end
npm install
# ou
pnpm install
```

2. **Configure a URL da API** em `src/lib/api/config.ts`

3. **Inicie o servidor de desenvolvimento:**
```bash
npm run dev
# ou
pnpm dev
```

## ⚙️ Configuração

### Variáveis de Ambiente (Backend)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `APP_ENVIRONMENT` | Ambiente de execução | `development` |
| `APP_API_V1_PREFIX` | Prefixo da API | `/api/v1` |
| `APP_MYSQL_USER` | Usuário MySQL | `metro` |
| `APP_MYSQL_PASSWORD` | Senha MySQL | `metro` |
| `APP_MYSQL_HOST` | Host MySQL | `127.0.0.1` |
| `APP_MYSQL_PORT` | Porta MySQL | `3306` |
| `APP_MYSQL_DB` | Nome do banco | `metro_bim` |
| `APP_UPLOADS_DIR` | Diretório de uploads | `storage/uploads` |
| `OPENAI_API_KEY` | Chave da API OpenAI | - |

### Configuração do Frontend

Edite `front-end/src/lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === 'true',
}
```

## 📖 Uso

### Acessando a Aplicação

1. Abra o navegador em `http://localhost:3000`
2. Faça login com suas credenciais
3. Acesse o dashboard para ver estatísticas gerais

### Criando um Projeto

1. Navegue para **Projetos** → **Novo Projeto**
2. Preencha:
   - Nome do projeto
   - Localização
   - Status inicial
3. Clique em **Criar Projeto**

### Fazendo Upload de Evidências

1. Acesse um projeto
2. Vá para **Evidências** → **Upload**
3. Selecione uma ou mais imagens
4. Adicione uma descrição (opcional)
5. Clique em **Enviar**

### Analisando com IA

1. Após o upload, a análise é iniciada automaticamente
2. Acompanhe o status na página de evidências
3. Quando concluída, visualize os problemas detectados

### Upload de Arquivo BIM

1. Acesse um projeto
2. Vá para a seção **IFC/BIM**
3. Faça upload do arquivo IFC
4. Aguarde o processamento
5. Visualize os elementos extraídos

### Gerando Relatórios

1. Acesse um projeto
2. Vá para **Relatórios**
3. Selecione o formato (PDF ou HTML)
4. Clique em **Gerar Relatório**
5. Aguarde a geração e baixe o arquivo

## 🔌 API

### Endpoints Principais

#### Health Check
```http
GET /api/v1/health
```

#### Análises

**Criar análise completa:**
```http
POST /api/v1/analyses
Content-Type: multipart/form-data

project_name: string
requested_by: string (opcional)
context: string (opcional)
bim_file: File
image_files: File[]
```

**Listar análises:**
```http
GET /api/v1/analyses?limit=20
```

**Obter análise por ID:**
```http
GET /api/v1/analyses/{analysis_id}
```

### Schemas de Resposta

#### ProjectAnalysisResponse
```json
{
  "id": "uuid",
  "project_name": "string",
  "requested_by": "string | null",
  "bim_source_uri": "string",
  "image_source_uri": "string",
  "status": "pending | running | completed | failed",
  "created_at": "datetime",
  "updated_at": "datetime",
  "notes": "string | null",
  "bim_analysis": { ... },
  "image_analysis": { ... },
  "comparison_result": { ... }
}
```

### Documentação Interativa

Com o servidor rodando, acesse:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 📁 Estrutura do Projeto

```
PI-Gest-o-de-Obras/
│
├── back-end/                 # Aplicação FastAPI
│   ├── app/
│   │   ├── core/            # Configurações
│   │   ├── domain/          # Lógica de negócio
│   │   ├── infrastructure/  # Implementações técnicas
│   │   ├── interfaces/      # API REST
│   │   ├── use_cases/       # Casos de uso
│   │   └── main.py
│   ├── alembic/             # Migrações
│   ├── tests/               # Testes
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── requirements.txt
│
├── front-end/                # Aplicação Next.js
│   ├── src/
│   │   ├── app/             # Rotas
│   │   ├── components/      # Componentes
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilitários
│   │   └── utils/           # Helpers
│   ├── public/              # Arquivos estáticos
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## 🧪 Testes

### Backend

Execute os testes:
```bash
cd back-end
pytest
```

Com cobertura:
```bash
pytest --cov=app --cov-report=html
```

### Frontend

Execute os testes (quando implementados):
```bash
cd front-end
npm test
```

## 🐳 Docker

### Comandos Úteis

**Iniciar serviços:**
```bash
docker-compose up -d
```

**Parar serviços:**
```bash
docker-compose down
```

**Ver logs:**
```bash
docker-compose logs -f api
```

**Executar comandos no container:**
```bash
docker-compose exec api alembic upgrade head
docker-compose exec api pytest
```

**Rebuild após mudanças:**
```bash
docker-compose up -d --build
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- **Python**: Siga PEP 8, use Ruff para linting
- **TypeScript**: Siga as regras do ESLint configuradas
- **Commits**: Use mensagens descritivas em português
- **Branches**: Use prefixos `feature/`, `fix/`, `refactor/`

## 📝 Licença

Este projeto é desenvolvido para fins acadêmicos e de pesquisa.

## 👥 Autores

Desenvolvido como Projeto Integrador (PI) para gestão de obras.

## 📞 Suporte

Para dúvidas ou problemas:
1. Abra uma issue no repositório
2. Consulte a documentação da API em `/docs`
3. Verifique os logs do servidor

## 🗺️ Roadmap

### Funcionalidades Futuras

- [ ] Autenticação com JWT e refresh tokens
- [ ] Sistema de permissões e roles
- [ ] Notificações em tempo real
- [ ] Exportação de dados em Excel/CSV
- [ ] Integração com APIs externas de BIM
- [ ] Visualizador 3D de modelos BIM
- [ ] Análise de vídeos de obras
- [ ] Dashboard com gráficos avançados
- [ ] API de webhooks
- [ ] Suporte a múltiplos idiomas

---

**Desenvolvido com ❤️ para melhorar a gestão de obras**
