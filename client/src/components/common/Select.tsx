import { ChangeEvent } from "react"
import { LuChevronDown } from "react-icons/lu"

interface SelectProps {
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    value: string
    options: string[]
    title: string
}

function Select({ onChange, value, options, title }: SelectProps) {
    return (
        <div className="relative w-full">
            <label
                className="mb-1.5 block text-xs font-medium text-slate-400"
                htmlFor={title}
            >
                {title}
            </label>
            <div className="relative">
                <select
                    id={title}
                    className="input-field py-1.5 px-2.5 pr-8 text-xs font-mono"
                    value={value}
                    onChange={onChange}
                    aria-label={title}
                >
                    {options.sort().map((option) => {
                        const val = option
                        const name =
                            option.charAt(0).toUpperCase() + option.slice(1)

                        return (
                            <option key={name} value={val}>
                                {name}
                            </option>
                        )
                    })}
                </select>
                <LuChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                />
            </div>
        </div>
    )
}

export default Select
