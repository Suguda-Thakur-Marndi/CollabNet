import { RemoteUser } from "@/types/user"
import { StateField, StateEffect } from "@codemirror/state"
import { EditorView, Decoration, DecorationSet, WidgetType } from "@codemirror/view"

export const updateRemoteUsers = StateEffect.define<RemoteUser[]>()

function getUserColor(username: string): string {

    const colors = [
        "#FF0000",
        "#008080",
        "#0000FF",
        "#008000",
        "#FFD700",
        "#800080",
        "#00CED1",
        "#FFA500",
        "#9932CC",
        "#1E90FF",
    ];

    let hash = 0
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

class CursorWidget extends WidgetType {
    constructor(private user: RemoteUser) {
        super()
    }

    eq(other: CursorWidget) {
        return this.user.username === other.user.username &&
               this.user.typing === other.user.typing
    }

    toDOM() {
        const color = getUserColor(this.user.username)
        const cursor = document.createElement("span")
        cursor.className = "cm-remote-cursor"
        cursor.style.cssText = `
            position: absolute;
            width: 2px;
            height: 1.2em;
            background-color: ${color};
            border-radius: 1px;
            pointer-events: none;
            z-index: 10;
            animation: cursor-blink 1s infinite;
        `

        const label = document.createElement("span")
        label.className = "cm-remote-cursor-label"
        label.textContent = this.user.username
        label.style.cssText = `
            position: absolute;
            top: -20px;
            left: 0;
            background-color: ${color};
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: 500;
            white-space: nowrap;
            pointer-events: none;
            z-index: 11;
            opacity: ${this.user.typing ? '1' : '0.7'};
            transition: opacity 0.3s ease;
        `

        cursor.appendChild(label)
        return cursor
    }
}

function createCursorDecoration(user: RemoteUser, pos: number) {
    return Decoration.widget({
        widget: new CursorWidget(user),
        side: 1,
    }).range(pos)
}

function createSelectionDecoration(user: RemoteUser, from: number, to: number) {
    const color = getUserColor(user.username)

    return Decoration.mark({
        class: "cm-remote-selection",
        attributes: {
            style: `
                background-color: ${color}33;
                border-left: 2px solid ${color};
                border-radius: 2px;
            `
        }
    }).range(from, to)
}

export const remoteUsersField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none
    },

    update(decorations, tr) {

        decorations = decorations.map(tr.changes)

        for (const effect of tr.effects) {
            if (effect.is(updateRemoteUsers)) {
                const users = effect.value
                const newDecorations: any[] = []

                for (const user of users) {
                    const hasSelection =
                        user.selectionStart !== undefined &&
                        user.selectionEnd !== undefined &&
                        user.selectionStart !== user.selectionEnd
                    const hasCursor =
                        user.cursorPosition !== undefined &&
                        user.cursorPosition >= 0

                    if (!user.typing && !hasSelection && !hasCursor) {
                        continue
                    }

                    if (hasSelection) {
                        const from = Math.min(
                            user.selectionStart as number,
                            tr.newDoc.length,
                        )
                        const to = Math.min(
                            user.selectionEnd as number,
                            tr.newDoc.length,
                        )
                        if (from < to) {
                            newDecorations.push(createSelectionDecoration(user, from, to))
                        }
                    }

                    if (hasCursor) {
                        const cursorPos = Math.min(
                            user.cursorPosition,
                            tr.newDoc.length,
                        )
                        newDecorations.push(createCursorDecoration(user, cursorPos))
                    }
                }

                newDecorations.sort((a, b) => {
                    const diff = a.from - b.from
                    if (diff !== 0) return diff
                    const aSide = a.value?.spec?.startSide || 0
                    const bSide = b.value?.spec?.startSide || 0
                    return aSide - bSide
                })
                return Decoration.set(newDecorations, true)
            }
        }

        return decorations
    },

    provide: f => EditorView.decorations.from(f)
})

export const remoteUserTheme = EditorView.baseTheme({
    ".cm-remote-cursor": {
        position: "relative",
        display: "inline-block",
    },

    ".cm-remote-selection": {
        position: "relative",
    },

    "@keyframes cursor-blink": {
        "0%, 50%": { opacity: "1" },
        "51%, 100%": { opacity: "0" }
    }
})

export function collaborativeHighlighting() {
    return [
        remoteUsersField,
        remoteUserTheme
    ]
}