import * as React from "react";
import { cn } from "../utils/cn";
import { UploadCloud, CheckCircle2 } from "lucide-react";

export interface FileUploadFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string;
  maxSizeMB?: number;
  onFileSelect?: (file: File) => void;
  selectedFile?: File | null;
  error?: string;
}

export function FileUploadField({
  accept,
  maxSizeMB = 5,
  onFileSelect,
  selectedFile,
  error,
  className,
  ...props
}: FileUploadFieldProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSelect = (file: File) => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      alert(`Arquivo excede o limite de ${maxSizeMB}MB.`);
      return;
    }
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerInput}
      className={cn(
        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-900/10 cursor-pointer transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 select-none",
        dragActive ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800",
        error ? "border-red-500 bg-red-500/5" : "",
        className
      )}
      {...props}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 bg-green-500/10 rounded-full border border-green-500/25 text-green-500 animate-pulse">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
            {selectedFile.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center space-y-2">
          <UploadCloud
            className={cn(
              "w-8 h-8 text-slate-400 dark:text-slate-500",
              dragActive && "text-primary animate-bounce"
            )}
          />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Arraste ou clique para enviar
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[180px] leading-relaxed">
            Formatos aceitos (PDF, JPG, PNG) até {maxSizeMB}MB
          </span>
        </div>
      )}
    </div>
  );
}
