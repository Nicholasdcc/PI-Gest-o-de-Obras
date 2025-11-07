"""Serviço simples para persistir arquivos enviados via API."""

from __future__ import annotations

import asyncio
import shutil
from pathlib import Path
from typing import Iterable
from uuid import uuid4

from fastapi import UploadFile


class FileStorageError(RuntimeError):
    """Erro ao salvar arquivo em disco."""


class LocalFileStorage:
    """Armazena arquivos em um diretório local da aplicação."""

    def __init__(self, *, base_path: Path) -> None:
        self._base_path = base_path
        self._base_path.mkdir(parents=True, exist_ok=True)

    async def save_upload_file(self, upload: UploadFile, *, subdir: str | None = None) -> str:
        """Persiste um arquivo individual e retorna o caminho absoluto."""

        target_dir = self._base_path / subdir if subdir else self._base_path
        target_dir.mkdir(parents=True, exist_ok=True)
        suffix = Path(upload.filename or "").suffix
        filename = f"{uuid4()}{suffix}"
        destination = target_dir / filename

        try:
            await asyncio.to_thread(self._write_file, upload, destination)
        except OSError as exc:  # pragma: no cover - erro de IO difícil de reproduzir
            raise FileStorageError("Falha ao armazenar arquivo enviado") from exc

        return str(destination.resolve())

    async def save_upload_files(
        self, uploads: Iterable[UploadFile], *, subdir: str | None = None
    ) -> list[str]:
        """Salva múltiplos arquivos em sequência."""

        paths: list[str] = []
        for upload in uploads:
            paths.append(await self.save_upload_file(upload, subdir=subdir))
        return paths

    @staticmethod
    def _write_file(upload: UploadFile, destination: Path) -> None:
        upload.file.seek(0)
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload.file, buffer)
        upload.file.seek(0)

