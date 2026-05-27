import { ChangeEvent } from "react"
import { PiCaretDownBold } from "react-icons/pi"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
}

function Select({ onChange, value, options, title }: SelectProps) {
    return (
        <div className="relative w-full">
            <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor={title}>
                {title}
            </label>
            <select
                id={title}
                className="w-full rounded-md border border-border bg-darkHover px-4 py-2.5 pr-10 text-white transition-all duration-200 outline-none hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={value}
                onChange={onChange}
                aria-label={title}
            >
                {options.sort().map((option) => {
                    const value = option
                    const name =
                        option.charAt(0).toUpperCase() + option.slice(1)

                    return (
                        <option key={name} value={value}>
                            {name}
                        </option>
                    )
                })}
            </select>
            <PiCaretDownBold
                size={16}
                className="pointer-events-none absolute bottom-3.5 right-3 text-slate-400"
                aria-hidden="true"
            />
        </div>
    )
}

export default Select
