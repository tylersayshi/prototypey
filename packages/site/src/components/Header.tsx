import { useState } from "react";

interface HeaderLinkProps {
	href: string;
	icon: React.ReactNode;
	label: string;
}

function HeaderLink({ href, icon, label }: HeaderLinkProps) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="text-gray-900 dark:text-gray-100 no-underline text-base font-semibold flex items-center gap-2 transition-opacity duration-200 hover:opacity-60"
		>
			{icon}
			{label}
		</a>
	);
}

export function Header() {
	const [copied, setCopied] = useState(false);

	const handleShare = () => {
		try {
			void navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => {
				setCopied(false);
			}, 1500);
		} catch (err) {
			console.error("Failed to copy URL:", err);
		}
	};

	return (
		<header className="py-8 px-8 pb-4 border-b border-gray-200 dark:border-gray-700">
			<div className="max-w-[1400px] mx-auto">
				<div className="flex justify-between items-start flex-col md:flex-row gap-4 md:gap-0">
					<div>
						<h1 className="text-4xl font-bold mb-2">
							<span className="text-gray-500 dark:text-gray-400">at://</span>
							prototypey
						</h1>
						<p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
							ATProto lexicon typescript toolkit
						</p>
					</div>
					<div className="flex flex-col items-end gap-4 w-full md:w-auto">
						<div className="flex gap-5 pt-2 md:pt-0 w-full md:w-auto justify-start">
							<HeaderLink
								href="https://github.com/tylersayshi/prototypey?tab=readme-ov-file#prototypey"
								icon={
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
										className="shrink-0"
									>
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
								}
								label="docs"
							/>
							<HeaderLink
								href="https://www.npmjs.com/package/prototypey"
								icon={
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
										className="shrink-0"
									>
										<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
										<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
										<line x1="12" y1="22.08" x2="12" y2="12" />
									</svg>
								}
								label="npm"
							/>
							<HeaderLink
								href="https://notes.tylur.dev/3m5a3do4eus2w"
								icon={
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
										className="shrink-0"
									>
										<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
										<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
									</svg>
								}
								label="story"
							/>
						</div>
						<button
							onClick={handleShare}
							className="text-gray-900 dark:text-gray-100 text-sm font-semibold flex items-center gap-2 transition-all duration-200 bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer py-2 px-4 shadow-none outline-none shrink-0 whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-900 dark:hover:border-gray-100"
							aria-label="share playground"
						>
							{copied ? (
								<>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
										className="shrink-0"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
									copied url!
								</>
							) : (
								<>
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										aria-hidden="true"
										className="shrink-0"
									>
										<circle cx="18" cy="5" r="3" />
										<circle cx="6" cy="12" r="3" />
										<circle cx="18" cy="19" r="3" />
										<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
										<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
									</svg>
									share
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</header>
	);
}
