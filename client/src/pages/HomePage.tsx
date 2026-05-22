import illustration from "@/assets/illustration.svg"
import FormComponent from "@/components/forms/FormComponent"

function HomePage() {
    return (
        <div className="home-gradient flex min-h-screen flex-col items-center justify-center px-4 py-12">
            <div className="flex w-full max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
                <div className="flex w-full max-w-md flex-col items-center lg:max-w-lg lg:items-start">
                    <img
                        src={illustration}
                        alt="Collaborative coding"
                        className="animate-up-down w-full max-w-[320px] sm:max-w-[400px]"
                    />
                    <ul className="mt-8 hidden space-y-2 text-sm text-muted lg:block">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Edit code together in real time
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Shared files, chat, and whiteboard
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Run code in 80+ languages
                        </li>
                    </ul>
                </div>
                <FormComponent />
            </div>
        </div>
    )
}

export default HomePage
