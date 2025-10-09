import { cn } from "lib/utils/utils";

export function ErrorMessage({ msg }: { msg: string }) {
    return (
        <div className={cn("text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2")}>
            {msg}
        </div>
    );
}
