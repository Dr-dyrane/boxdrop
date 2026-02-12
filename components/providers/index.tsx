"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";
import { ThemeToggle } from "../ui/theme-toggle";

export function AppProviders({ children }: { children: React.ReactNode }) {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    return (
        <APIProvider apiKey={googleMapsApiKey}>
            <QueryProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </QueryProvider>
        </APIProvider>
    );
}
