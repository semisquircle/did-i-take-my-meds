export const slugify = (name) => {
	return name
		// Normalize Unicode (e.g. "é" → "e" + combining accent)
		.normalize("NFKD")
		// Remove combining diacritical marks
		.replace(/[\u0300-\u036f]/g, "")
		// Lowercase and trim whitespace
		.toLowerCase()
		.trim()
		// Replace spaces, underscores, and dashes with a single hyphen
		.replace(/[\s_-]+/g, "-")
		// Remove any character that isn't alphanumeric, underscore, or hyphen
		.replace(/[^\w-]/g, "")
		// Remove leading/trailing hyphens
		.replace(/^-+|-+$/g, "");
};

export const cmpVersion = (a, b) => {
	const aArr = a.split(".");
	const bArr = b.split(".");
	const len = Math.max(a.length, b.length);
	for (let i = 0; i < len; i++) {
		if (aArr[i] === undefined) aArr[i] = "0";
		if (bArr[i] === undefined) bArr[i] = "0";
		const cmp = parseInt(aArr[i], 10) - parseInt(b[i], 10);
		if (cmp !== 0) return (cmp < 0 ? -1 : 1);
	}
	return 0;
};

export const hexToRGBA = (hex) => {
	const value = hex.replace("#", "");
	return [
		parseInt(value.substring(0, 2), 16),
		parseInt(value.substring(2, 4), 16),
		parseInt(value.substring(4, 6), 16),
		(value.substring(6, 8)) ? parseInt(value.substring(6, 8), 16) : 255,
	];
};

export const invertHexColor = (hex) => {
	// Remove leading hash if present
	let cleanHex = hex.replace(/^#/, "");

	// Convert 3-digit shorthand hex to 6-digit hex (e.g., "F00" -> "FF0000")
	if (cleanHex.length === 3) {
		cleanHex = cleanHex
		.split("")
		.map((char) => char + char)
		.join("");
	}

	if (cleanHex.length !== 6) {
		throw new Error("Invalid HEX color length. Must be 3 or 6 characters.");
	}

	// Parse integer components
	const r = parseInt(cleanHex.slice(0, 2), 16);
	const g = parseInt(cleanHex.slice(2, 4), 16);
	const b = parseInt(cleanHex.slice(4, 6), 16);

	if (isNaN(r) || isNaN(g) || isNaN(b)) {
		throw new Error("Invalid characters in HEX color string.");
	}

	// Invert individual RGB channels
	const invertedR = (255 - r).toString(16).padStart(2, "0");
	const invertedG = (255 - g).toString(16).padStart(2, "0");
	const invertedB = (255 - b).toString(16).padStart(2, "0");

	return `#${invertedR}${invertedG}${invertedB}`;
};
