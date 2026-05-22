import { ReactNode } from "react"

interface SplitterComponentProps {
    children: ReactNode
}

function SplitterComponent({ children }: SplitterComponentProps) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-dark text-white">
            {children}
        </div>
    )
}

export default SplitterComponent
