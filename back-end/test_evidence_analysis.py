#!/usr/bin/env python3
"""Script para testar o upload e análise de evidências."""

import asyncio
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import get_settings
from app.infrastructure.services import OpenAIService
from app.infrastructure.db.session import get_session
from app.infrastructure.services.evidence_processor import process_evidence_file
from uuid import uuid4


async def test_evidence_analysis():
    """Testa a análise de evidência com OpenAI."""
    
    print("=" * 70)
    print("🧪 TESTE DE ANÁLISE DE EVIDÊNCIAS")
    print("=" * 70)
    
    # Inicializar serviços
    settings = get_settings()
    ai_service = OpenAIService(settings=settings)
    
    print(f"\n📋 Configurações:")
    print(f"   - OpenAI API Key: {'*' * 20}{settings.openai.api_key[-8:]}")
    print(f"   - Model Image: {settings.openai.model_image}")
    print(f"   - Usando Mock: {ai_service._use_mock}")
    
    # Testar com uma imagem mockada (não existe no disco, será capturado pelo tratamento de erro)
    test_evidence_id = uuid4()
    test_file_path = "test/sample_construction.jpg"
    
    print(f"\n🔬 Teste 1: Simulação de análise")
    print(f"   - Evidence ID: {test_evidence_id}")
    print(f"   - File Path: {test_file_path}")
    
    try:
        # Como o arquivo não existe, isso vai falhar mas mostrará os logs
        async for session in get_session():
            await process_evidence_file(
                test_evidence_id,
                test_file_path,
                session,
                ai_service
            )
    except Exception as e:
        print(f"\n⚠️  Erro esperado (arquivo não existe): {e}")
    
    print(f"\n✅ Teste concluído!")
    print("\n" + "=" * 70)
    print("📝 INSTRUÇÕES PARA TESTE REAL:")
    print("=" * 70)
    print("1. Faça upload de uma imagem pelo front-end")
    print("2. Observe os logs do servidor back-end")
    print("3. Você verá os emojis de progresso:")
    print("   🔍 - Iniciando análise")
    print("   📷 - Analisando imagem")
    print("   🤖 - Chamando OpenAI")
    print("   ✅ - Análise concluída")
    print("   📝 - Resumo da análise")
    print("   ⚠️  - Issues encontradas")
    print("   📌 - Detalhes de cada issue")
    print("   💾 - Salvando no banco")
    print("   ❌ - Erros (se houver)")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(test_evidence_analysis())
