import React, { useState } from 'react';
import {
  FolderArchive,
  Download,
  Check,
  AlertCircle,
  Copy,
  Terminal,
  ExternalLink,
  X,
  FileCheck2,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({ isOpen, onClose }) => {
  const [downloadingFormat, setDownloadingFormat] = useState<'zip' | 'tar' | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const downloadDirectly = async (format: 'zip' | 'tar') => {
    setDownloadingFormat(format);
    setErrorMessage(null);
    setDownloadStatus(format === 'zip' ? 'Verificando y descargando ZIP...' : 'Descargando TAR.GZ...');

    const fileName = format === 'zip' ? 'galicia-trip-project.zip' : 'galicia-trip-project.tar.gz';
    const endpoint = format === 'zip' ? '/galicia-trip-project.zip' : '/galicia-trip-project.tar.gz';

    try {
      // 1. Fetch file as arrayBuffer to verify integrity
      const response = await fetch(endpoint, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`El servidor respondió con código HTTP ${response.status}`);
      }

      const blob = await response.blob();

      // Sanity checks on size
      if (blob.size < 50000) {
        throw new Error(`El archivo descargado es demasiado pequeño (${blob.size} bytes). Posible error de red.`);
      }

      // If format is ZIP, verify the magic bytes (PK\x03\x04 = 0x50, 0x4B, 0x03, 0x04)
      if (format === 'zip') {
        const headerSlice = await blob.slice(0, 4).arrayBuffer();
        const header = new Uint8Array(headerSlice);
        const isPkZip = header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
        if (!isPkZip) {
          throw new Error('Firma de archivo ZIP no válida (posible respuesta de redirección o HTML).');
        }
      }

      // 2. Trigger browser download using safe Blob URL
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 3000);

      setDownloadStatus(`✓ ${fileName} descargado correctamente (${(blob.size / (1024 * 1024)).toFixed(2)} MB).`);
    } catch (err: any) {
      console.error('Error al descargar archivo:', err);
      setErrorMessage(err.message || 'Error al procesar la descarga.');
      setDownloadStatus(null);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const copyWgetCommand = () => {
    const currentOrigin = window.location.origin;
    const cmd = `curl -O "${currentOrigin}/galicia-trip-project.zip" && unzip galicia-trip-project.zip -d galicia-trip`;
    navigator.clipboard?.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0F0F0F] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-5 text-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400">
                Paquete de Despliegue VPS / Coolify
              </span>
              <h3 className="text-lg font-bold text-white">Exportar Código Fuente del Proyecto</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <FileCheck2 className="w-4 h-4" />
              <span>Estructura 100% compatible con Windows Explorer y Linux</span>
            </span>
            <span className="text-slate-500">54 archivos · ~2.3 MB</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Incluye frontend React 19 (Vite), backend Node/Express (<code className="text-blue-300">server.ts</code>), <code className="text-blue-300">Dockerfile</code>, <code className="text-blue-300">docker-compose.yml</code> y tu archivo <code className="text-emerald-300">.env</code> con las claves de Supabase y Google Maps preconfiguradas.
          </p>
        </div>

        {/* Feedback Messages */}
        {downloadStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>{downloadStatus}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Download Buttons */}
        <div className="space-y-2.5">
          {/* Main ZIP Download Button */}
          <button
            type="button"
            onClick={() => downloadDirectly('zip')}
            disabled={downloadingFormat !== null}
            className="w-full flex items-center justify-between p-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-mono text-xs font-bold transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {downloadingFormat === 'zip' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Descargar ZIP (Directo Verificado)</span>
            </span>
            <span className="text-[10px] bg-blue-700/80 px-2 py-0.5 rounded text-blue-100">
              galicia-trip-project.zip
            </span>
          </button>

          {/* Secondary TAR.GZ Download Button */}
          <button
            type="button"
            onClick={() => downloadDirectly('tar')}
            disabled={downloadingFormat !== null}
            className="w-full flex items-center justify-between p-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-200 border border-slate-700 rounded-xl font-mono text-xs transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              {downloadingFormat === 'tar' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <HardDrive className="w-4 h-4 text-purple-400" />
              )}
              <span>Formato Alternativo: TAR.GZ (Linux / VPS)</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
              .tar.gz
            </span>
          </button>
        </div>

        {/* Direct Link fallback for iframe issues */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500 text-[11px]">¿Tu navegador bloquea descargas dentro del visor?</span>
          <a
            href="/galicia-trip-project.zip"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 underline text-[11px]"
          >
            <span>Abrir enlace directo</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Copy command for VPS */}
        <div className="bg-[#141414] p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>O descarga directamente desde la terminal de tu VPS:</span>
            </span>
            <button
              onClick={copyWgetCommand}
              className="flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCmd ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <code className="text-slate-300 text-[10px] break-all block bg-black/40 p-2 rounded border border-slate-800/80">
            curl -O "{window.location.origin}/galicia-trip-project.zip"
          </code>
        </div>
      </div>
    </div>
  );
};
