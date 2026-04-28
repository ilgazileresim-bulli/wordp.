export interface RecentDocument {
    id: string;
    title: string;
    content: string;
    lastModified: number;
    preview: string;
    wordCount: number;
}

const STORAGE_KEY = "macrotar_recent_documents";
const MAX_DOCUMENTS = 20;

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function extractPreview(content: string): string {
    // Strip HTML tags and get first 120 chars
    const text = content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    return text.substring(0, 120) || "Boş belge";
}

function countWords(content: string): number {
    const text = content.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
}

function extractTitle(content: string): string {
    // Try to get first heading or first line of text
    const headingMatch = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    if (headingMatch) {
        const title = headingMatch[1].replace(/<[^>]*>/g, "").trim();
        if (title) return title.substring(0, 60);
    }
    const textMatch = content.replace(/<[^>]*>/g, "").trim();
    if (textMatch) return textMatch.substring(0, 60) || "Adsız Belge";
    return "Adsız Belge";
}

export function getRecentDocuments(): RecentDocument[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data) as RecentDocument[];
    } catch {
        return [];
    }
}

export function saveRecentDocument(content: string, existingId?: string): string {
    if (!content || content.trim() === "" || content === "<p></p>") return existingId || "";

    const docs = getRecentDocuments();
    const id = existingId || generateId();
    const title = extractTitle(content);
    const preview = extractPreview(content);
    const wordCount = countWords(content);

    // Remove existing doc with same id if updating
    const filtered = docs.filter((d) => d.id !== id);

    const doc: RecentDocument = {
        id,
        title,
        content,
        lastModified: Date.now(),
        preview,
        wordCount,
    };

    filtered.unshift(doc);

    // Keep only MAX_DOCUMENTS
    const trimmed = filtered.slice(0, MAX_DOCUMENTS);

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
        // If storage is full, remove oldest documents and try again
        const smaller = trimmed.slice(0, 10);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(smaller));
        } catch {
            // Give up silently
        }
    }

    return id;
}

export function deleteRecentDocument(id: string): void {
    const docs = getRecentDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
        // ignore
    }
}

export function clearRecentDocuments(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}

export function getRecentDocumentById(id: string): RecentDocument | null {
    const docs = getRecentDocuments();
    return docs.find((d) => d.id === id) || null;
}
