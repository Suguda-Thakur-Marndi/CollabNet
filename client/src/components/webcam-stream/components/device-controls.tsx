import { cn } from "@/lib/utils"
import { type ElementType, useCallback, useEffect, useRef, useState } from "react"
import { FiChevronDown } from "react-icons/fi"
import toast from "react-hot-toast"
import { tooltipStyles } from "@/components/sidebar/tooltipStyles"
import { Tooltip } from "react-tooltip"

import type { MediaDevice } from "../types"

interface DeviceButtonProps {
    devices: MediaDevice[]
    disabled?: boolean
    disableToggle?: boolean
    icon: ElementType
    isEnabled: boolean
    label: string
    onDevicePermissionGranted?: (
        kind: "videoinput" | "audioinput" | "audiooutput",
    ) => Promise<void>
    onDeviceSelect: (deviceId: string) => void
    onToggle: () => void
    selectedDevice: string
}

const DeviceControls = ({
    icon: Icon,
    label,
    devices,
    selectedDevice,
    onDeviceSelect,
    onToggle,
    isEnabled,
    disabled = false,
    disableToggle = false,
    onDevicePermissionGranted,
}: DeviceButtonProps) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const tooltipId = `device-${label.toLowerCase()}`

    const validDevices = devices.filter((device) => device.deviceId !== "")
    const hasValidDevices = validDevices.length > 0
    const activeDeviceId =
        selectedDevice || validDevices[0]?.deviceId || ""

    const requestPermissions = useCallback(async () => {
        const getDeviceKind = () => {
            switch (label.toLowerCase()) {
                case "camera":
                    return "videoinput" as const
                case "microphone":
                    return "audioinput" as const
                case "speaker":
                    return "audiooutput" as const
                default:
                    return null
            }
        }
        try {
            const deviceKind = getDeviceKind()
            if (!deviceKind) return false

            if (deviceKind === "audiooutput") {
                const allDevices =
                    await navigator.mediaDevices.enumerateDevices()
                const hasOutputDevices = allDevices.some(
                    (device) =>
                        device.kind === "audiooutput" &&
                        device.deviceId &&
                        device.label,
                )
                if (!hasOutputDevices) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                    })
                    for (const track of stream.getTracks()) track.stop()
                }
            } else {
                const constraints = {
                    [deviceKind === "videoinput" ? "video" : "audio"]: true,
                }
                const stream =
                    await navigator.mediaDevices.getUserMedia(constraints)
                for (const track of stream.getTracks()) track.stop()
            }

            if (onDevicePermissionGranted) {
                await onDevicePermissionGranted(deviceKind)
            }
            return true
        } catch (error) {
            console.error("Error requesting permissions:", error)
            toast.error(
                `Please grant ${label.toLowerCase()} permissions to see available devices`,
            )
            return false
        }
    }, [label, onDevicePermissionGranted])

    const openMenu = async () => {
        if (!hasValidDevices) {
            const success = await requestPermissions()
            if (!success) return
        }
        setMenuOpen((open) => !open)
    }

    useEffect(() => {
        if (!menuOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () =>
            document.removeEventListener("mousedown", handleClickOutside)
    }, [menuOpen])

    const toggleTitle = disableToggle
        ? `Turn on camera first to use ${label}`
        : isEnabled
          ? `Turn off ${label}`
          : label.toLowerCase() === "microphone"
            ? "Turn on microphone (voice only)"
            : `Turn on ${label}`

    return (
        <div className="device-control relative" ref={menuRef}>
            <button
                type="button"
                aria-label={`Toggle ${label}`}
                data-tooltip-id={tooltipId}
                data-tooltip-content={toggleTitle}
                className={cn(
                    "device-control__toggle",
                    isEnabled
                        ? "device-control__toggle--on"
                        : "device-control__toggle--off",
                )}
                disabled={disabled || disableToggle}
                onClick={onToggle}
            >
                <Icon className="size-5" />
            </button>

            <button
                type="button"
                aria-label={`Select ${label} device`}
                data-tooltip-id={tooltipId}
                data-tooltip-content={`Select ${label}`}
                className={cn(
                    "device-control__menu-trigger",
                    isEnabled && "device-control__menu-trigger--on",
                )}
                disabled={disabled}
                onClick={openMenu}
            >
                <FiChevronDown
                    className={cn(
                        "size-4 transition-transform",
                        menuOpen && "rotate-180",
                    )}
                />
            </button>

            <Tooltip
                id={tooltipId}
                place="top"
                className="!z-[100]"
                style={tooltipStyles}
            />

            {menuOpen && (
                <div className="device-control__menu" role="listbox">
                    {hasValidDevices ? (
                        validDevices.map((device) => (
                            <button
                                key={device.deviceId}
                                type="button"
                                role="option"
                                aria-selected={
                                    device.deviceId === activeDeviceId
                                }
                                className={cn(
                                    "device-control__menu-item",
                                    device.deviceId === activeDeviceId &&
                                        "device-control__menu-item--active",
                                )}
                                onClick={() => {
                                    onDeviceSelect(device.deviceId)
                                    setMenuOpen(false)
                                }}
                            >
                                {device.label ||
                                    `${label} ${device.deviceId.slice(0, 4)}`}
                            </button>
                        ))
                    ) : (
                        <p className="px-2 py-2 text-xs italic text-muted">
                            Allow {label.toLowerCase()} access…
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export { DeviceControls }
