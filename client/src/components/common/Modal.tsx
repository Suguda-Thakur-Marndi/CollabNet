import { ReactNode, useEffect, useRef } from "react"
import { LuX } from "react-icons/lu"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
    footer?: ReactNode
    maxWidth?: string
}

export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = "max-w-md",
}: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={overlayRef}
            className="modal-overlay"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose()
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={contentRef}
                className={`modal-content ${maxWidth} flex flex-col`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border bg-surface-elevated/50 px-5 py-3.5">
                    <div>
                        <h2
                            id="modal-title"
                            className="text-sm font-semibold tracking-tight text-white"
                        >
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-0.5 text-xs text-muted">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost p-1 text-muted hover:text-white"
                        aria-label="Close dialog"
                    >
                        <LuX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-2.5 border-t border-border bg-surface-elevated/30 px-5 py-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}
