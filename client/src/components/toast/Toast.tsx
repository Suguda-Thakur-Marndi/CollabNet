import { Toaster } from "react-hot-toast"

function Toast() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                className: "",
                style: {
                    background: "#2d2f36",
                    color: "#f1f5f9",
                    border: "1px solid #3d404a",
                    borderRadius: "10px",
                    fontSize: "14px",
                    maxWidth: "360px",
                },
                success: {
                    iconTheme: {
                        primary: "#00e676",
                        secondary: "#1e1f26",
                    },
                },
                error: {
                    iconTheme: {
                        primary: "#ff5252",
                        secondary: "#1e1f26",
                    },
                },
            }}
        />
    )
}

export default Toast
