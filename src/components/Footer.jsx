import { FaGithub, FaLinkedin } from "react-icons/fa";
import logoDark from "../assets/logo/logo-dark.webp";
import logoLight from "../assets/logo/logo-light.webp";
import { useHourlyMessage } from "../hooks/useHourlyMessage";

const LINKS = [
    {
        label: "Codeforces",
        href: "https://codeforces.com/profile/shohagfaraji",
        icon: null,
        iconImg: logoLight,
        color: "var(--accent-blue)",
    },
    {
        label: "GitHub",
        href: "https://github.com/shohagfaraji/",
        icon: FaGithub,
        iconImg: null,
        color: "var(--accent-blue)",
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/shohagfaraji",
        icon: FaLinkedin,
        iconImg: null,
        color: "var(--accent-blue)",
    },
];

function Footer({ theme }) {
    const message = useHourlyMessage();

    return (
        <footer
            className="mt-10 border-t"
            style={{ borderColor: "var(--line)" }}
        >
            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 flex flex-col sm:flex-row sm:items-start gap-8 sm:gap-12">
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                        <img
                            src={theme === "dark" ? logoDark : logoLight}
                            alt="Copeforces"
                            className="w-9 h-9 flex-shrink-0"
                            draggable="false"
                        />
                        <span className="font-bold text-base">Copeforces</span>
                    </div>
                    <p
                        className="text-sm leading-relaxed max-w-md mx-auto sm:mx-0"
                        style={{ color: "var(--muted)" }}
                    >
                        {message}
                    </p>
                </div>

                <div className="w-full sm:w-auto sm:flex-shrink-0 text-center sm:text-left">
                    <h3
                        className="font-mono-cf text-xs font-bold uppercase tracking-wider mb-3"
                        style={{ color: "var(--muted)" }}
                    >
                        Connect
                    </h3>
                    <div className="flex flex-row flex-wrap justify-center sm:flex-col sm:justify-start gap-5 sm:gap-2.5">
                        {LINKS.map(
                            ({ label, href, icon: Icon, iconImg, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                                    style={{ color }}
                                >
                                    {Icon ? (
                                        <Icon />
                                    ) : iconImg ? (
                                        <img
                                            src={iconImg}
                                            alt=""
                                            className="w-4 h-4"
                                        />
                                    ) : null}
                                    {label}
                                </a>
                            ),
                        )}
                    </div>
                </div>
            </div>

            <div
                className="border-t py-4 text-center text-xs font-mono-cf"
                style={{ borderColor: "var(--line)", color: "var(--muted)" }}
            >
                Copyright {new Date().getFullYear()} Copeforces. All rights
                reserved.
            </div>
        </footer>
    );
}

export default Footer;
