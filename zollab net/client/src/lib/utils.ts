import classNames from "classnames"

export const cn = (...classes: classNames.ArgumentArray) =>
    classNames(...classes)

export const parseError = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return String(error)
}
