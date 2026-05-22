import { BrowserRouter, Route, Routes } from "react-router-dom"
import AppProvider from "./context/AppProvider"
import HomePage from "./pages/HomePage"
import EditorPage from "./pages/EditorPage"
import Toast from "./components/toast/Toast"

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
            </BrowserRouter>
            <Toast />
        </AppProvider>
    )
}

export default App
