"use client";

import Heading from "@/components/ui/Heading";
import { Save } from "lucide-react";
import { BackupData } from "./data";

export default function BackupPage() {
    return (
        <div className="mx-[1em] p-4 flex flex-col space-y-4 bg-white">
            <Heading text="Backup & Restore" Icon={Save} />
            <p className="text-sm text-lightgrey-krnd">Import and export the latest database here.</p>
            <div className="flex-1 min-h-0 space-y-4">
                <BackupData></BackupData>
            </div>
        </div>
    )
}