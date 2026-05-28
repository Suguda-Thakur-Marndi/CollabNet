import illustration from "@/assets/illustration.png"
import FormComponent from "@/components/forms/FormComponent"

function HomePage() {
    return (
        <div className="home-gradient flex min-h-screen flex-col items-center justify-center px-4 py-12">
            <div className="flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
                <div className="flex w-full max-w-md flex-col items-center lg:max-w-lg lg:items-start">
                    <img
                        src={illustration}
                        alt="Illustration showing collaborative coding with multiple users"
                        className="animate-up-down w-full max-w-[320px] sm:max-w-[400px] drop-shadow-lg mb-6"
                    />
                    <ul className="mt-8 hidden space-y-3 text-sm text-slate-300 lg:block">
                        <li className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <span className="leading-relaxed">Edit code together in real time</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <span className="leading-relaxed">Shared files, chat, and whiteboard</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            <span className="leading-relaxed">Run code in 80+ languages</span>
                        </li>
                    </ul>
                </div>
                <FormComponent />
            </div>
        </div>
    )
}

export default HomePage
