#!/usr/bin/env python3
"""Script de teste para verificar os endpoints da API."""

import asyncio
import sys
from uuid import uuid4

import httpx


BASE_URL = "http://localhost:8000/api/v1"


async def test_health():
    """Testa o endpoint de health check."""
    print("🔍 Testando health check...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check OK:", response.json())
            return True
        else:
            print("❌ Health check falhou:", response.status_code)
            return False


async def test_create_project():
    """Testa criação de projeto."""
    print("\n🔍 Testando criação de projeto...")
    async with httpx.AsyncClient() as client:
        data = {
            "name": f"Projeto Teste {uuid4().hex[:8]}",
            "location": "São Paulo, SP",
            "status": "active"
        }
        response = await client.post(f"{BASE_URL}/projects", json=data)
        if response.status_code == 201:
            project = response.json()
            print("✅ Projeto criado:", project["id"])
            return project["id"]
        else:
            print("❌ Falha ao criar projeto:", response.status_code, response.text)
            return None


async def test_list_projects():
    """Testa listagem de projetos."""
    print("\n🔍 Testando listagem de projetos...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/projects")
        if response.status_code == 200:
            projects = response.json()
            print(f"✅ {len(projects)} projetos encontrados")
            return True
        else:
            print("❌ Falha ao listar projetos:", response.status_code)
            return False


async def test_get_project(project_id: str):
    """Testa obtenção de projeto específico."""
    print(f"\n🔍 Testando obtenção do projeto {project_id}...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/projects/{project_id}")
        if response.status_code == 200:
            project = response.json()
            print(f"✅ Projeto obtido: {project['name']}")
            return True
        else:
            print("❌ Falha ao obter projeto:", response.status_code)
            return False


async def test_list_evidences(project_id: str):
    """Testa listagem de evidências."""
    print(f"\n🔍 Testando listagem de evidências do projeto {project_id}...")
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/projects/{project_id}/evidences")
        if response.status_code == 200:
            evidences = response.json()
            print(f"✅ {len(evidences)} evidências encontradas")
            return True
        else:
            print("❌ Falha ao listar evidências:", response.status_code)
            return False


async def main():
    """Executa todos os testes."""
    print("=" * 60)
    print("TESTANDO API DO BACK-END")
    print("=" * 60)
    
    # Teste 1: Health check
    if not await test_health():
        print("\n❌ API não está respondendo. Verifique se o servidor está rodando.")
        sys.exit(1)
    
    # Teste 2: Criar projeto
    project_id = await test_create_project()
    if not project_id:
        print("\n❌ Não foi possível criar projeto. Verifique o banco de dados.")
        sys.exit(1)
    
    # Teste 3: Listar projetos
    await test_list_projects()
    
    # Teste 4: Obter projeto específico
    await test_get_project(project_id)
    
    # Teste 5: Listar evidências do projeto
    await test_list_evidences(project_id)
    
    print("\n" + "=" * 60)
    print("✅ TODOS OS TESTES PASSARAM!")
    print("=" * 60)
    print("\nA API está funcionando corretamente. Você pode:")
    print("1. Acessar http://localhost:8000/docs para documentação interativa")
    print("2. Iniciar o front-end com 'cd front-end && pnpm dev'")
    print("3. Criar projetos e fazer upload de evidências pelo front-end")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Testes interrompidos pelo usuário")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Erro durante os testes: {e}")
        sys.exit(1)
