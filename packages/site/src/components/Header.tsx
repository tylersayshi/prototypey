export function Header() {
	return (
		<header
			style={{
				padding: "2rem 2rem 1rem 2rem",
				borderBottom: "1px solid var(--color-border)",
			}}
		>
			<div style={{ maxWidth: "1400px", margin: "0 auto" }}>
				<div className="header-content">
					<div>
						<h1
							style={{
								fontSize: "2.5rem",
								fontWeight: "700",
								marginBottom: "0.5rem",
							}}
						>
							<span style={{ color: "var(--color-text-secondary)" }}>
								at://
							</span>
							prototypey
						</h1>
						<p
							style={{
								fontSize: "1.125rem",
								color: "var(--color-text-secondary)",
								marginTop: "0.5rem",
							}}
						>
							Type-safe lexicon inference for ATProto schemas
						</p>
					</div>
					<div className="header-links">
						<a
							href="https://github.com/tylersayshi/prototypey"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: "var(--color-text-heading)",
								textDecoration: "none",
								fontSize: "1rem",
								fontWeight: "600",
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								transition: "opacity 0.2s",
							}}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							GitHub
						</a>
						<a
							href="https://www.npmjs.com/package/prototypey"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								color: "var(--color-text-heading)",
								textDecoration: "none",
								fontSize: "1rem",
								fontWeight: "600",
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								transition: "opacity 0.2s",
							}}
							onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
							onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
						>
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
							>
								<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
								<polyline points="3.27 6.96 12 12.01 20.73 6.96" />
								<line x1="12" y1="22.08" x2="12" y2="12" />
							</svg>
							npm
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}
