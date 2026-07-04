export default function Navbar() {
    return (
        <nav className="w-full border-b border-zinc-800 bg-black">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">

                <div>
                    <h1 className="text-3xl font-bold text-white">
                        ScaleProposal AI
                    </h1>

                    <p className="text-sm text-zinc-400">
                        Multi-Agent Proposal Generator
                    </p>
                </div>

                <div className="rounded-full bg-green-500/20 px-4 py-2 text-green-400 font-medium">
                    ● AI Online
                </div>

            </div>
        </nav>
    );
}