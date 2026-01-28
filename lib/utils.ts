import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function toTitleCase(str: string) {
    if (!str) return ""
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
}

export function getRelationRank(rel?: string) {
    const r = (rel || "").trim().toLowerCase();
    if (r === "kepala keluarga" || r.includes("kepala")) return 1;
    if (r === "istri") return 2;
    if (r === "anak") return 3;
    if (r === "cucu") return 4;
    return 99;
}
