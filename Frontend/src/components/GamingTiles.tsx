"use client";

import Image from "next/image";

export function GamingTiles() {
    const tiles = [
        { name: "BGMI", src: "/games/tiles/BGMI.jpeg" },
        { name: "Valorant", src: "/games/tiles/Valorant.png" },
        { name: "Free Fire Max", src: "/games/tiles/FREEFIRE_MAX.png" },
        { name: "Call of Duty Mobile", src: "/games/tiles/COD.png" }
    ];

    return (
        <section className="bg-[#0A0A0A] pb-12 pt-4">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {tiles.map((tile, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl w-full max-w-[220px] mx-auto h-14 md:h-16 flex justify-center items-center p-4 hover:scale-105 transition-transform duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(0,255,102,0.3)] cursor-pointer"
                        >
                            <div className="relative w-full h-full flex justify-center items-center">
                                {/* Next.js Image component handles optimization */}
                                <img
                                    src={tile.src}
                                    alt={tile.name}
                                    className="max-w-full max-h-full object-contain drop-shadow-md"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
