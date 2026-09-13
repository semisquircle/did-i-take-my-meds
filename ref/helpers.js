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
}
