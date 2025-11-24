"""Serviço para processar evidências (imagens)."""

from __future__ import annotations

import logging
from pathlib import Path
from uuid import UUID
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.infrastructure.db.models import EvidenceModel, IssueModel
from app.infrastructure.db.session import get_session
from app.infrastructure.services import OpenAIService


logger = logging.getLogger(__name__)


async def process_evidence_file(
    evidence_id: UUID,
    file_path: str,
    ai_service: OpenAIService
) -> None:
    """
    Processa uma evidência (imagem) e analisa usando OpenAI Vision.
    Cria sua própria sessão do banco de dados.
    
    Args:
        evidence_id: ID da evidência no banco
        file_path: Caminho do arquivo de imagem (pode ser relativo ou absoluto)
        ai_service: Serviço OpenAI para análise
    """
    # Criar nova sessão do banco para esta task assíncrona
    async for db in get_session():
        try:
            await _process_evidence_with_session(evidence_id, file_path, db, ai_service)
        finally:
            await db.close()
        break  # Executar apenas uma vez


async def _process_evidence_with_session(
    evidence_id: UUID,
    file_path: str,
    db: AsyncSession,
    ai_service: OpenAIService
) -> None:
    """
    Função interna que faz o processamento com uma sessão válida.
    
    Args:
        evidence_id: ID da evidência no banco
        file_path: Caminho do arquivo de imagem (pode ser relativo ou absoluto)
        db: Sessão do banco de dados
        ai_service: Serviço OpenAI para análise
    """
    try:
        logger.info(f"🔍 Iniciando análise da evidência {evidence_id}")
        
        # Garantir que o caminho é absoluto
        from app.core.config import get_settings
        settings = get_settings()
        
        if not Path(file_path).is_absolute():
            file_path = str(settings.app.uploads_path / file_path)
        
        # Verificar se arquivo existe
        if not Path(file_path).exists():
            raise ValueError(f"Arquivo não encontrado: {file_path}")
        
        logger.info(f"📷 Analisando imagem: {file_path}")
        
        # Buscar evidência
        result = await db.execute(
            select(EvidenceModel).where(EvidenceModel.id == evidence_id)
        )
        evidence = result.scalar_one_or_none()
        
        if not evidence:
            raise ValueError(f"Evidência {evidence_id} não encontrada no banco")
        
        # Atualizar status para processing
        evidence.status = "processing"
        await db.commit()
        
        logger.info(f"🤖 Chamando OpenAI para análise da imagem...")
        
        # Analisar com OpenAI Vision
        # Por enquanto, usar file:// URL local - em produção deveria ser HTTP URL
        image_analysis = await ai_service.analyze_image(
            image_source=f"file://{file_path}",
            project_context=f"Projeto de construção"
        )
        
        logger.info(f"✅ Análise concluída! Status: {image_analysis.status}")
        logger.info(f"📝 Resumo: {image_analysis.summary}")
        logger.info(f"⚠️  Issues encontradas: {len(image_analysis.issues)}")
        
        # Criar issues no banco
        issues_created = 0
        for issue in image_analysis.issues:
            new_issue = IssueModel(
                evidence_id=evidence_id,
                type="structural",  # Pode ser categorizado melhor
                description=issue.description,
                confidence=issue.confidence,
                severity=issue.severity.value,
                location=issue.location_hint,
            )
            db.add(new_issue)
            issues_created += 1
            logger.info(f"  📌 Issue {issues_created}: {issue.description} (severidade: {issue.severity.value})")
        
        # Atualizar evidência
        evidence.status = "completed"
        evidence.analyzed_at = datetime.utcnow()
        
        await db.commit()
        
        logger.info(f"💾 Evidência {evidence_id} processada com sucesso!")
        logger.info(f"   - Status: completed")
        logger.info(f"   - Issues criadas: {issues_created}")
        
    except Exception as e:
        logger.error(f"❌ Erro ao processar evidência {evidence_id}: {e}")
        logger.exception(e)
        
        # Marcar como erro
        result = await db.execute(
            select(EvidenceModel).where(EvidenceModel.id == evidence_id)
        )
        evidence = result.scalar_one_or_none()
        if evidence:
            evidence.status = "error"
            await db.commit()
