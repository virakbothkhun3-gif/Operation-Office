import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { MerchantRequest } from '../types';
import { parseExistingDataFile, downloadSampleIntegrationTemplate } from '../utils/dataImport';

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newRequests: MerchantRequest[], mode: 'append' | 'replace') => void;
}

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedList, setParsedList] = useState<MerchantRequest[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    setErrors([]);
    setParsedList([]);

    const result = await parseExistingDataFile(selectedFile);
    setIsProcessing(false);
    setParsedList(result.requests);
    setErrors(result.errors);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedList([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!parsedList.length) return;
    onImport(parsedList, importMode);
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-2 sm:p-4 overscroll-contain animate-in fade-in">
      <div className="min-h-full flex items-center justify-center py-4 sm:py-8">
        <div className="bg-[#19191d] border border-[rgba(240,240,242,0.12)] rounded-xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-[rgba(255,255,255,0.02)] border-b border-[rgba(240,240,242,0.08)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2ecc71]/10 border border-[#2ecc71]/30 flex items-center justify-center text-[#2ecc71]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-[#f0f0f2]">
                Import Existing Data File
              </h2>
              <p className="text-[11px] text-[rgba(240,240,242,0.5)]">
                Add existing records from Excel (.xlsx, .xls), CSV, or JSON
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[rgba(240,240,242,0.5)] hover:text-[#f0f0f2] p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Actions: Template Download */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] text-xs">
            <div className="text-[rgba(240,240,242,0.7)]">
              Need standard column headers? Download our pre-formatted template.
            </div>
            <button
              type="button"
              onClick={downloadSampleIntegrationTemplate}
              className="btn-action-secondary text-xs flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#2ecc71]" />
              <span>Download Template (.xlsx)</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#2ecc71] bg-[#2ecc71]/5'
                  : 'border-[rgba(240,240,242,0.15)] hover:border-[rgba(240,240,242,0.3)] bg-[#0f0f11]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[rgba(240,240,242,0.7)] mb-1">
                  <Upload className="w-6 h-6 text-[#2ecc71]" />
                </div>
                <div className="text-sm font-medium text-[#f0f0f2]">
                  Click to select file or drag & drop here
                </div>
                <div className="text-xs text-[rgba(240,240,242,0.5)] font-mono">
                  Supported: Excel (.xlsx, .xls), Comma-separated (.csv), or JSON (.json)
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Banner */}
              <div className="flex items-center justify-between p-3 bg-[#0f0f11] border border-[rgba(240,240,242,0.12)] rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#2ecc71]" />
                  <div>
                    <div className="text-xs font-semibold text-[#f0f0f2]">{file.name}</div>
                    <div className="text-[10px] font-mono text-[rgba(240,240,242,0.5)]">
                      {(file.size / 1024).toFixed(1)} KB · {parsedList.length} rows detected
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-action-secondary text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Choose Another</span>
                </button>
              </div>

              {/* Error messages */}
              {errors.length > 0 && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>File Processing Warnings</span>
                  </div>
                  {errors.map((err, i) => (
                    <div key={i} className="pl-5 text-[11px] opacity-90">{err}</div>
                  ))}
                </div>
              )}

              {/* Data Preview Table */}
              {parsedList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[rgba(240,240,242,0.5)]">
                    <span>DATA PREVIEW ({parsedList.length} RECORDS READY TO IMPORT)</span>
                    <span className="text-[#2ecc71] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validated
                    </span>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-[rgba(240,240,242,0.08)] bg-[#0f0f11] rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-white/[0.02] text-[10px] uppercase font-mono text-[rgba(240,240,242,0.5)] border-b border-[rgba(240,240,242,0.08)] sticky top-0">
                        <tr>
                          <th className="p-2.5">Merchant Company</th>
                          <th className="p-2.5">Outlet</th>
                          <th className="p-2.5">POS S/N</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Assigned Staff</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(240,240,242,0.04)] text-[11px]">
                        {parsedList.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-white/[0.01]">
                            <td className="p-2.5 font-medium text-[#f0f0f2]">{r.merchantName}</td>
                            <td className="p-2.5 text-[rgba(240,240,242,0.7)]">{r.outletName}</td>
                            <td className="p-2.5 font-mono text-[#2ecc71]">{r.serialNumber}</td>
                            <td className="p-2.5 text-[rgba(240,240,242,0.7)]">{r.integrationType}</td>
                            <td className="p-2.5 text-[rgba(240,240,242,0.7)]">{r.assignedStaff}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-[#f0f0f2]">
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedList.length > 10 && (
                    <div className="text-[10px] font-mono text-[rgba(240,240,242,0.4)] text-center">
                      Showing preview of first 10 rows · {parsedList.length - 10} more records will be imported
                    </div>
                  )}

                  {/* Import Mode Options */}
                  <div className="p-3 bg-[#0f0f11] border border-[rgba(240,240,242,0.08)] rounded-lg space-y-2">
                    <label className="block text-xs font-mono uppercase text-[rgba(240,240,242,0.6)]">
                      Import Strategy
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                        importMode === 'append'
                          ? 'border-[#2ecc71] bg-[#2ecc71]/5 text-[#f0f0f2]'
                          : 'border-[rgba(240,240,242,0.08)] text-[rgba(240,240,242,0.6)] hover:bg-white/5'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-semibold">Add to Existing Requests</div>
                          <div className="text-[11px] text-[rgba(240,240,242,0.4)]">
                            Keeps all current merchant records and appends new ones
                          </div>
                        </div>
                      </label>

                      <label className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                        importMode === 'replace'
                          ? 'border-amber-500 bg-amber-500/5 text-[#f0f0f2]'
                          : 'border-[rgba(240,240,242,0.08)] text-[rgba(240,240,242,0.6)] hover:bg-white/5'
                      }`}>
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-semibold">Replace All Records</div>
                          <div className="text-[11px] text-[rgba(240,240,242,0.4)]">
                            Overwrites current records with the contents of this file
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[rgba(255,255,255,0.02)] border-t border-[rgba(240,240,242,0.08)] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-action-secondary text-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!parsedList.length || isProcessing}
            className="btn-action-primary text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isProcessing
                ? 'Parsing File...'
                : parsedList.length > 0
                ? `Confirm & Import (${parsedList.length} Requests)`
                : 'Upload File to Continue'}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
};
