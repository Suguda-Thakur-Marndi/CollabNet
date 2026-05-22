import { FileSystemItem, Id } from "@/types/file"
import { v4 as uuidv4 } from "uuid"

const initialCode = `function sayHi() {
  console.log("👋 Hello world");
}

sayHi()`

export const initialFileStructure: FileSystemItem = {
    name: "root",
    id: uuidv4(),
    type: "directory",
    children: [
        {
            id: uuidv4(),
            type: "file",
            name: "index.js",
            content: initialCode,
        },
    ],
}

export const findParentDirectory = (
    directory: FileSystemItem,
    parentDirId: Id,
): FileSystemItem | null => {

    if (directory.id === parentDirId && directory.type === "directory") {
        return directory
    }

    if (directory.type === "directory" && directory.children) {
        for (const child of directory.children) {
            const found = findParentDirectory(child, parentDirId)
            if (found) {
                return found
            }
        }
    }

    return null
}

export const isFileExist = (parentDir: FileSystemItem, name: string) => {
    if (!parentDir.children) return false
    return parentDir.children.some((file) => file.name === name)
}

export const getFileById = (
    fileStructure: FileSystemItem,
    fileId: Id,
): FileSystemItem | null => {
    const findFile = (directory: FileSystemItem): FileSystemItem | null => {
        if (directory.id === fileId) {
            return directory
        } else if (directory.children) {
            for (const child of directory.children) {
                const found = findFile(child)
                if (found) {
                    return found
                }
            }
        }
        return null
    }

    return findFile(fileStructure)
}

export const sortFileSystemItem = (item: FileSystemItem): FileSystemItem => {

    if (item.type === "directory" && item.children) {

        let directories = item.children.filter(
            (child) => child.type === "directory",
        )
        const files = item.children.filter((child) => child.type === "file")

        directories.sort((a, b) => a.name.localeCompare(b.name))

        directories = directories.map((dir) => sortFileSystemItem(dir))

        files.sort((a, b) => a.name.localeCompare(b.name))

        item.children = [
            ...directories.filter((dir) => dir.name.startsWith(".")),
            ...directories.filter((dir) => !dir.name.startsWith(".")),
            ...files.filter((file) => file.name.startsWith(".")),
            ...files.filter((file) => !file.name.startsWith(".")),
        ]
    }

    return item
}
