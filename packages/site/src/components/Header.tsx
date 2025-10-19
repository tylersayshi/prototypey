export function Header() {
	return (
		<header
			style={{
				padding: "2rem 2rem 1rem 2rem",
				borderBottom: "1px solid #e5e7eb",
			}}
		>
			<div style={{ maxWidth: "1400px", margin: "0 auto" }}>
				<h1
					style={{
						fontSize: "2.5rem",
						fontWeight: "700",
						marginBottom: "0.5rem",
					}}
				>
					<span style={{ color: "#6b7280" }}>at://</span>prototypey
				</h1>
				<p
					style={{
						fontSize: "1.125rem",
						color: "#6b7280",
						marginTop: "0.5rem",
					}}
				>
					Type-safe lexicon inference for ATProto schemas
				</p>
			</div>
		</header>
	);
}
