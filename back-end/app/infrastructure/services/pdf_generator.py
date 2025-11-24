"""Gerador de relatórios em PDF."""

from datetime import datetime
from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def generate_project_report_pdf(report_data: dict, output_path: Path) -> Path:
    """
    Gera um relatório em PDF a partir dos dados do projeto.
    
    Args:
        report_data: Dicionário com dados do relatório
        output_path: Caminho onde o PDF será salvo
        
    Returns:
        Path do arquivo PDF gerado
    """
    # Cria o diretório se não existir
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Configura o documento
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#001489'),
        spaceAfter=30,
        alignment=TA_CENTER,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#001489'),
        spaceAfter=12,
        spaceBefore=12,
    )
    
    normal_style = styles['Normal']
    
    # Conteúdo do PDF
    story = []
    
    # Título
    story.append(Paragraph("Relatório de Inspeção de Obras", title_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Informações do projeto
    story.append(Paragraph(f"<b>Projeto:</b> {report_data['project_name']}", normal_style))
    story.append(Paragraph(f"<b>Data de Geração:</b> {datetime.fromisoformat(report_data['generated_at']).strftime('%d/%m/%Y %H:%M')}", normal_style))
    story.append(Spacer(1, 1*cm))
    
    # Resumo Executivo
    story.append(Paragraph("Resumo Executivo", heading_style))
    
    summary = report_data['summary']
    summary_data = [
        ['Métrica', 'Valor'],
        ['Total de Evidências', str(summary['total_evidences'])],
        ['Total de Issues', str(summary['total_issues'])],
        ['Issues Críticos', str(summary['critical_issues'])],
        ['Issues de Alta Prioridade', str(summary['high_issues'])],
        ['Modelos IFC', str(summary['ifc_models_count'])],
    ]
    
    summary_table = Table(summary_data, colWidths=[10*cm, 5*cm])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#001489')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    
    story.append(summary_table)
    story.append(Spacer(1, 1*cm))
    
    # Issues Detalhados
    if report_data['issues']:
        story.append(Paragraph("Issues Identificados", heading_style))
        
        for idx, issue in enumerate(report_data['issues'], 1):
            # Cor baseada na severidade
            severity_colors = {
                'critical': colors.red,
                'high': colors.orange,
                'medium': colors.yellow,
                'low': colors.lightgreen,
            }
            severity_color = severity_colors.get(issue.get('severity', 'medium'), colors.grey)
            
            issue_style = ParagraphStyle(
                f'Issue{idx}',
                parent=normal_style,
                leftIndent=20,
                bulletColor=severity_color,
            )
            
            story.append(Paragraph(
                f"<b>{idx}. {issue['type']}</b> "
                f"<font color='{severity_color.hexval()}'>[{issue.get('severity', 'N/A').upper()}]</font>",
                normal_style
            ))
            story.append(Paragraph(f"• {issue['description']}", issue_style))
            story.append(Paragraph(f"• Confiança: {int(issue['confidence'] * 100)}%", issue_style))
            
            if issue.get('location'):
                location = issue['location']
                if isinstance(location, dict):
                    loc_str = f"{location.get('description', 'N/A')}"
                else:
                    loc_str = str(location)
                story.append(Paragraph(f"• Localização: {loc_str}", issue_style))
            
            story.append(Spacer(1, 0.3*cm))
    else:
        story.append(Paragraph("Nenhum issue identificado.", normal_style))
    
    story.append(Spacer(1, 1*cm))
    
    # Evidências
    story.append(PageBreak())
    story.append(Paragraph("Evidências Coletadas", heading_style))
    
    if report_data['evidences']:
        evidence_data = [['#', 'Status', 'Data de Upload', 'Issues']]
        
        for idx, evidence in enumerate(report_data['evidences'], 1):
            evidence_data.append([
                str(idx),
                evidence['status'],
                datetime.fromisoformat(evidence['uploaded_at']).strftime('%d/%m/%Y') if evidence['uploaded_at'] else 'N/A',
                str(evidence['issues_count'])
            ])
        
        evidence_table = Table(evidence_data, colWidths=[1*cm, 3*cm, 4*cm, 2*cm])
        evidence_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#001489')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        story.append(evidence_table)
    else:
        story.append(Paragraph("Nenhuma evidência encontrada.", normal_style))
    
    story.append(Spacer(1, 1*cm))
    
    # Modelos IFC
    if report_data['ifc_models']:
        story.append(Paragraph("Modelos IFC", heading_style))
        
        ifc_data = [['#', 'Schema', 'Status', 'Elementos']]
        
        for idx, ifc in enumerate(report_data['ifc_models'], 1):
            ifc_data.append([
                str(idx),
                ifc.get('schema', 'N/A'),
                ifc.get('status', 'N/A'),
                str(ifc.get('elements_count', 0))
            ])
        
        ifc_table = Table(ifc_data, colWidths=[1*cm, 3*cm, 3*cm, 3*cm])
        ifc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#001489')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        story.append(ifc_table)
    
    # Rodapé
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph(
        f"<i>Relatório gerado automaticamente em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</i>",
        ParagraphStyle('Footer', parent=normal_style, fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
    ))
    
    # Gera o PDF
    doc.build(story)
    
    return output_path
