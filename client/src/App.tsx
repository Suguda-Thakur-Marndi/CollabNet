import { BrowserRouter, Route, Routes } from "react-router-dom"
import AppProvider from "./context/AppProvider"
import { Suspense, lazy } from "react"
import Toast from "./components/toast/Toast"

const HomePage = lazy(() => import("./pages/HomePage"))
const EditorPage = lazy(() => import("./pages/EditorPage"))

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center text-lg text-slate-400">Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/editor/:roomId" element={<EditorPage />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toast />
        </AppProvider>
    )
}

export default App
