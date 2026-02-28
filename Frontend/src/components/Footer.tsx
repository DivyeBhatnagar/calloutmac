"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    FaInstagram,
    FaXTwitter,
    FaDiscord,
    FaYoutube,
    FaLinkedin,
    FaFacebook,
    FaArrowRight
} from "react-icons/fa6";
import { RiMailSendLine, RiTimeLine } from "react-icons/ri";

function FooterLink({ href, children }: { href?: string; children: React.ReactNode }) {
    const content = (
        <span className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 w-fit cursor-pointer">
            <span className="relative">
                {children}
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-neon-green transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_8px_#00FF66]"></span>
            </span>
            <FaArrowRight className="opacity-0 -translate-x-2 text-neon-green text-[10px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
        </span>
    );

    if (href) {
        return (
            <Link href={href} className="inline-block">
                {content}
            </Link>
        );
    }
    return <div className="inline-block">{content}</div>;
}

export function Footer() {
    const socials = [
        { Icon: FaInstagram, href: "https://instagram.com/calloutesports" },
        { Icon: FaDiscord, href: "https://discord.gg/calloutesports" },
        { Icon: FaYoutube, href: "https://youtube.com/@calloutesports" }
    ];

    return (
        <footer className="bg-black relative overflow-hidden border-t border-[#00FF66] shadow-[0_-5px_20px_rgba(0,255,102,0.15)] z-10 pt-10 pb-4">
            <div className="container mx-auto px-6">

                {/* Top Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

                    {/* Column 1 - BRAND */}
                    <div className="flex flex-col relative lg:col-span-1">
                        {/* Radial Glow */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00FF66]/20 blur-[60px] rounded-full pointer-events-none z-0"></div>

                        <div className="relative z-10">
                            <h2 className="text-3xl font-black font-orbitron tracking-widest text-white mb-2 text-glow">
                                CALL<span className="text-[#00FF66]">OUT</span>
                            </h2>
                            <p className="text-[#00FF66] text-xs uppercase tracking-widest mb-4 font-mono font-bold drop-shadow-[0_0_8px_rgba(0,255,102,0.5)]">
                                Esports
                            </p>

                            <h3 className="text-white font-bold text-lg mb-2">
                                Building India's Ultimate Esports Community
                            </h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Competitive tournaments. Fair play. Real rewards.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)]">
                                        <RiMailSendLine size={18} />
                                    </div>
                                    <a href="mailto:calloutesports@gmail.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                                        calloutesports@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center text-[#00FF66] drop-shadow-[0_0_8px_rgba(0,255,102,0.6)] shrink-0">
                                        <RiTimeLine size={18} />
                                    </div>
                                    <div className="text-sm text-gray-400 flex flex-col gap-1">
                                        <span>Mon–Fri: 10 AM – 8 PM IST</span>
                                        <span>Sat: 10 AM – 6 PM IST</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 - COMPANY */}
                    <div className="flex flex-col">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Company</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            <FooterLink href="/about">About Us</FooterLink>
                            <FooterLink>Our Team</FooterLink>
                            <FooterLink>Careers</FooterLink>
                            <FooterLink>Press & Media</FooterLink>
                            <FooterLink href="/query">Contact Us</FooterLink>
                        </div>
                    </div>

                    {/* Column 3 - PLATFORM */}
                    <div className="flex flex-col">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Platform</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            <FooterLink>How It Works</FooterLink>
                            <FooterLink href="/tournaments">Tournaments</FooterLink>
                            <FooterLink href="/games">Games</FooterLink>
                            <FooterLink>Pricing</FooterLink>
                            <FooterLink>FAQ</FooterLink>
                        </div>
                    </div>

                    {/* Column 4 - SUPPORT */}
                    <div className="flex flex-col">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Support</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            <FooterLink>Help Center</FooterLink>
                            <FooterLink href="/query">Submit Query</FooterLink>
                            <FooterLink>Report Issue</FooterLink>
                            <FooterLink href="/conduct">Community Guidelines</FooterLink>
                            <FooterLink>Contact Support</FooterLink>
                        </div>
                    </div>

                    {/* Column 5 - LEGAL */}
                    <div className="flex flex-col">
                        <h4 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Legal</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium">
                            <FooterLink href="/terms">Terms of Service</FooterLink>
                            <FooterLink href="/privacy">Privacy Policy</FooterLink>
                            <FooterLink href="/refund">Refund Policy</FooterLink>
                            <FooterLink href="/rules">Tournament Rules</FooterLink>
                            <FooterLink href="/conduct">Code of Conduct</FooterLink>
                        </div>
                    </div>

                </div>

                {/* Social Media Row */}
                <div className="flex justify-center flex-wrap gap-4 mt-12 mb-6">
                    {socials.map((social, i) => (
                        <motion.a
                            key={i}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#00FF66] hover:border-[#00FF66] transition-colors duration-300"
                            whileHover={{ scale: 1.15, boxShadow: '0 0 20px rgba(0, 255, 102, 0.6)' }}
                        >
                            <social.Icon size={20} />
                        </motion.a>
                    ))}
                </div>

                {/* Bottom Strip */}
                <div className="border-t border-[#00FF66]/20 pt-4 mt-6 flex justify-center">
                    <p className="text-gray-500 font-mono text-xs tracking-widest uppercase">
                        © 2026 CallOut Esports. All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
}
