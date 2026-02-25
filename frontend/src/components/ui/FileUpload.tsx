import { useRef, useState } from 'react'
import { Upload, X, FileText, Image, File } from 'lucide-react'

export interface UploadedFile {
  id: string
  file: File
  previewUrl?: string
  name: string
  size: number
  type: string
}

interface FileUploadProps {
  label?: string
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  onFilesChange?: (files: UploadedFile[]) => void
  hint?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/')) return <Image size={18} aria-hidden="true" />
  if (type === 'application/pdf') return <FileText size={18} aria-hidden="true" />
  return <File size={18} aria-hidden="true" />
}

export function FileUpload({
  label = 'Anexar arquivo',
  accept = 'image/*,application/pdf,.doc,.docx',
  multiple = false,
  maxSizeMB = 10,
  onFilesChange,
  hint,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    setError(null)
    const valid: UploadedFile[] = []

    Array.from(newFiles).forEach(file => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`"${file.name}" excede o limite de ${maxSizeMB} MB.`)
        return
      }
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      valid.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      })
    })

    const updated = multiple ? [...files, ...valid] : valid
    setFiles(updated)
    onFilesChange?.(updated)
  }

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </p>
      )}

      {/* Drop zone */}
      <div
        className="rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 py-5 px-4 text-center"
        style={{
          borderColor: dragOver ? 'var(--color-primary)' : 'var(--color-border-dark)',
          background: dragOver ? 'var(--color-primary-muted)' : 'var(--color-surface-alt)',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
        role="button"
        tabIndex={0}
        aria-label={label}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(29,78,216,0.1)', color: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          <Upload size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
            Clique para selecionar
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
            ou arraste e solte aqui
          </p>
        </div>
        {hint && (
          <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{hint}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={e => addFiles(e.target.files)}
        aria-hidden="true"
      />

      {/* Error */}
      {error && (
        <p className="text-xs font-medium" style={{ color: 'var(--color-cancelado)' }}>
          {error}
        </p>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Arquivos selecionados">
          {files.map(f => (
            <li
              key={f.id}
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{
                background: 'var(--color-surface-alt)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Preview or icon */}
              {f.previewUrl ? (
                <img
                  src={f.previewUrl}
                  alt={f.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(29,78,216,0.1)', color: 'var(--color-primary)' }}
                  aria-hidden="true"
                >
                  <FileIcon type={f.type} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {f.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {formatSize(f.size)}
                </p>
              </div>

              <button
                onClick={() => removeFile(f.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{ color: 'var(--color-text-tertiary)', background: 'var(--color-surface)' }}
                aria-label={`Remover ${f.name}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
