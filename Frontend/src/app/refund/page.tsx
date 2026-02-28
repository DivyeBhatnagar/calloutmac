export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-black pt-24 pb-12 px-6">
            <div className="container mx-auto max-w-4xl bg-black/40 border border-white/10 rounded-xl p-8 backdrop-blur-sm">
                <h1 className="text-4xl font-orbitron font-bold text-white mb-6 glow-text tracking-wider">REFUND POLICY</h1>
                <div className="space-y-6 text-gray-400 font-sans leading-relaxed">
                    <p>Last Updated: February 2026</p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Registration Cancellation</h2>
                    <p>Tournament entry fees are generally non-refundable unless the tournament is canceled by CallOut Esports.</p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Exceptions</h2>
                    <p>Refunds may be issued in the following exceptional circumstances:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>The tournament schedule is changed significantly, preventing the team from participating.</li>
                        <li>Technical failures on our platform that prevent successful tournament entry post-payment.</li>
                        <li>A team withdraws their registration at least 48 hours prior to the tournament start time (subject to a processing fee).</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Disqualification</h2>
                    <p>Teams disqualified from a tournament due to a breach of the Code of Conduct or specific Tournament Rules are not eligible for a refund.</p>

                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Processing Time</h2>
                    <p>Approved refunds will be processed back to the original method of payment within 5-7 business days.</p>
                </div>
            </div>
        </div>
    );
}
