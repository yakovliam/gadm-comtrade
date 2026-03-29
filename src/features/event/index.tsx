import useEventStore from "@/core/store/useEventStore";
import { Button } from "@/components/ui/button";
import useUploadCff from "./useUploadCff";
import { FileUpIcon } from "lucide-react";

const EventIndex = () => {
  const events = useEventStore((state) => state.events);
  const { inputRef, openFilePicker, handleFileChange } = useUploadCff();

  return (
    <div className="flex flex-col items-center justify-start p-4 h-full text-white text-center">
      <input
        ref={inputRef}
        type="file"
        accept=".cff"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Import Button */}
      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={openFilePicker}
      >
        <FileUpIcon />
        Import Event
      </Button>

      {/* Table of Events */}
    </div>
  );
};

export default EventIndex;
