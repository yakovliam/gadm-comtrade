import { useCallback, useRef } from "react";
import { parseCffFile } from "@/lib/parser/comtrade-parser";
import useEventStore from "@/core/store/useEventStore";

/**
 * Hook that provides a file-input ref and handler for uploading
 * a COMTRADE IEEE CFF file, parsing it, and adding the resulting
 * event to the global store.
 */
const useUploadCff = () => {
    const addEvent = useEventStore((state) => state.addEvent);
    const inputRef = useRef<HTMLInputElement>(null);

    const openFilePicker = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
                const stream = file.stream() as ReadableStream<Uint8Array<ArrayBuffer>>;
                const event = await parseCffFile(stream);
                addEvent(event);
            } catch (err) {
                console.error("Failed to parse CFF file:", err);
            }

            // Reset so the same file can be re-selected if needed
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        },
        [addEvent],
    );

    return { inputRef, openFilePicker, handleFileChange };
};

export default useUploadCff;
