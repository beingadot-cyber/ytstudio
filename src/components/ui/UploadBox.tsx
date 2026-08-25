"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadBoxProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export function UploadBox({ value, onChange, label = "Thumbnail" }: UploadBoxProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const valid = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      setError("Unsupported format. Use JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum 5MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        onChange(data.url);
      } else {
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (value) {
    return (
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        <div className="relative group rounded-xl overflow-hidden border border-white/10 aspect-video bg-black/30">
          <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs text-white font-medium transition-colors"
            >
              Replace
            </button>
            <button
              onClick={() => onChange(null)}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleInputChange} className="hidden" />
        <p className="text-xs text-slate-600">16:9 ratio recommended — 1280×720px</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all aspect-video flex flex-col items-center justify-center gap-3",
          dragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/3"
        )}
      >
        {uploading ? (
          <>
            <div className="w-8 h-8 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium">
                Drag & drop or <span className="text-indigo-400">browse files</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">JPG, JPEG, PNG, WEBP — Max 5MB</p>
              <p className="text-xs text-slate-600">Recommended: 1280×720 (16:9)</p>
            </div>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleInputChange} className="hidden" />
    </div>
  );
}
