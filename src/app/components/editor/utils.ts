import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const PAGE_HEIGHT_MM = 297;
export const PX_PER_MM = 3.78;
