"""Serviço para processar arquivos IFC."""

from __future__ import annotations

import logging
from pathlib import Path
from uuid import UUID

import ifcopenshell
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.infrastructure.db.models import IfcModel, IfcElementModel, IfcComparisonModel
from app.infrastructure.services import OpenAIService


logger = logging.getLogger(__name__)


async def process_ifc_file(
    ifc_id: UUID,
    file_path: str,
    db: AsyncSession,
    ai_service: OpenAIService | None = None
) -> None:
    """
    Processa um arquivo IFC e extrai elementos e análises.
    
    Args:
        ifc_id: ID do modelo IFC no banco
        file_path: Caminho do arquivo IFC (pode ser relativo ou absoluto)
        db: Sessão do banco de dados
        ai_service: Serviço OpenAI para análise (opcional)
    """
    try:
        logger.info(f"Iniciando processamento do IFC {ifc_id}")
        
        # Garantir que o caminho é absoluto
        from app.core.config import get_settings
        settings = get_settings()
        
        if not Path(file_path).is_absolute():
            # Se for relativo, usar o diretório de uploads
            file_path = str(settings.app.uploads_path / file_path)
        
        # Verificar se arquivo existe
        if not Path(file_path).exists():
            raise ValueError(f"Arquivo não encontrado: {file_path}")
        
        logger.info(f"Abrindo arquivo IFC: {file_path}")
        
        # Carregar arquivo IFC
        try:
            ifc_file = ifcopenshell.open(file_path)
        except Exception as parse_error:
            error_msg = str(parse_error)
            if "Unable to parse IFC SPF header" in error_msg:
                raise ValueError(
                    "Arquivo não é um IFC válido. "
                    "Por favor, envie um arquivo .ifc no formato correto (IFC2X3 ou IFC4)."
                )
            raise ValueError(f"Erro ao ler arquivo IFC: {error_msg}")
        
        # Extrair schema
        schema = ifc_file.schema
        
        # Extrair elementos principais
        elements = []
        element_types = [
            'IfcWall', 'IfcSlab', 'IfcBeam', 'IfcColumn', 
            'IfcDoor', 'IfcWindow', 'IfcStair', 'IfcRoof'
        ]
        
        for element_type in element_types:
            ifc_elements = ifc_file.by_type(element_type)
            for elem in ifc_elements[:100]:  # Limitar a 100 elementos por tipo
                try:
                    name = elem.Name or f"{element_type}_{elem.id()}"
                    elements.append(IfcElementModel(
                        ifc_model_id=ifc_id,
                        ifc_id=str(elem.id()),
                        name=name,
                        category=element_type,
                        code=getattr(elem, 'Tag', None),
                        properties={}
                    ))
                except Exception as e:
                    logger.warning(f"Erro ao processar elemento {elem.id()}: {e}")
        
        # Salvar elementos no banco
        if elements:
            db.add_all(elements)
        
        # Atualizar modelo IFC
        result = await db.execute(
            select(IfcModel).where(IfcModel.id == ifc_id)
        )
        ifc_model = result.scalar_one_or_none()
        
        if ifc_model:
            ifc_model.status = "ready"
            ifc_model.schema = schema
            ifc_model.elements_count = len(elements)
            from datetime import datetime
            ifc_model.processed_at = datetime.utcnow()
            
            # Análise com OpenAI (opcional)
            if ai_service and len(elements) > 0:
                try:
                    comparisons = await analyze_ifc_with_ai(
                        ifc_model, elements, ai_service
                    )
                    if comparisons:
                        db.add_all(comparisons)
                except Exception as e:
                    logger.error(f"Erro na análise com IA: {e}")
            
            await db.commit()
            logger.info(f"IFC {ifc_id} processado: {len(elements)} elementos")
        
        # Limpar referência ao arquivo IFC
        try:
            del ifc_file
        except:
            pass
        
    except ValueError as ve:
        # Erros de validação (arquivo inválido, não encontrado)
        error_message = str(ve)
        logger.error(f"Erro de validação ao processar IFC {ifc_id}: {error_message}")
        result = await db.execute(
            select(IfcModel).where(IfcModel.id == ifc_id)
        )
        ifc_model = result.scalar_one_or_none()
        if ifc_model:
            ifc_model.status = "error"
            ifc_model.error_message = error_message
            await db.commit()
        
        # Limpar referência ao arquivo se existir
        if 'ifc_file' in locals():
            try:
                del ifc_file
            except:
                pass
        
    except Exception as e:
        logger.error(f"Erro ao processar IFC {ifc_id}: {e}")
        # Marcar como erro
        result = await db.execute(
            select(IfcModel).where(IfcModel.id == ifc_id)
        )
        ifc_model = result.scalar_one_or_none()
        if ifc_model:
            ifc_model.status = "error"
            ifc_model.error_message = f"Erro interno: {str(e)}"
            await db.commit()
        
        # Limpar referência ao arquivo se existir
        if 'ifc_file' in locals():
            try:
                del ifc_file
            except:
                pass


async def analyze_ifc_with_ai(
    ifc_model: IfcModel,
    elements: list[IfcElementModel],
    ai_service: OpenAIService
) -> list[IfcComparisonModel]:
    """
    Analisa elementos IFC usando OpenAI para identificar problemas.
    
    Args:
        ifc_model: Modelo IFC
        elements: Lista de elementos extraídos
        ai_service: Serviço OpenAI
        
    Returns:
        Lista de comparações/problemas identificados
    """
    try:
        # Preparar resumo dos elementos para o ChatGPT
        element_summary = []
        for elem in elements[:50]:  # Limitar para não exceder tokens
            element_summary.append(f"- {elem.category}: {elem.name}")
        
        elements_text = "\n".join(element_summary)
        
        prompt = f"""Analise o seguinte modelo BIM/IFC e identifique possíveis problemas ou recomendações:

Schema: {ifc_model.schema}
Total de elementos: {len(elements)}

Principais elementos:
{elements_text}

Forneça até 3 observações sobre:
1. Possíveis inconsistências
2. Elementos que merecem atenção
3. Recomendações de boas práticas

Formato: Para cada observação, indique tipo, descrição e severidade (low/medium/high)."""

        # TODO: Implementar chamada real ao OpenAI
        # Por enquanto, retornar comparações mockadas baseadas nos elementos reais
        comparisons = []
        
        if len(elements) < 10:
            comparisons.append(IfcComparisonModel(
                ifc_model_id=ifc_model.id,
                type="completeness",
                description=f"Modelo possui apenas {len(elements)} elementos. Verifique se o modelo está completo.",
                severity="medium",
                details={"total_elements": len(elements)}
            ))
        
        if any(e.category == 'IfcWall' for e in elements):
            comparisons.append(IfcComparisonModel(
                ifc_model_id=ifc_model.id,
                type="structural",
                description="Paredes identificadas. Verifique espessuras e materiais conforme projeto estrutural.",
                severity="low",
                details={"element_type": "IfcWall"}
            ))
        
        return comparisons
        
    except Exception as e:
        logger.error(f"Erro na análise com IA: {e}")
        return []
