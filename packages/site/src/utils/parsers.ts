import { createParser } from "nuqs";
import LZString from "lz-string";

/**
 * Custom nuqs parser for LZ-string compressed values
 *
 * This parser automatically compresses values when serializing to URL
 * and decompresses when parsing from URL, keeping URLs shorter for large data.
 */
export const parseAsCompressed = createParser({
	parse(query: string): string | null {
		if (!query || query.trim() === "") {
			return null;
		}

		// Decompress the value from the URL
		const decompressed = LZString.decompressFromEncodedURIComponent(query);

		// Return null if decompression fails
		return decompressed || null;
	},

	serialize(value: string): string {
		// Compress the value for the URL
		return LZString.compressToEncodedURIComponent(value);
	},

	eq(a: string, b: string): boolean {
		return a === b;
	},
});
