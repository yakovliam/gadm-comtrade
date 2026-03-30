import useEventStore from "@/core/store/useEventStore";
import { Button } from "@/components/ui/button";
import useUploadCff from "./useUploadCff";
import { FileUpIcon } from "lucide-react";
import EventTable from "./event-table";

const EventIndex = () => {
  const events = useEventStore((state) => state.events);
  const { inputRef, openFilePicker, handleFileChange } = useUploadCff();

  return (
    <div className="flex flex-col items-center justify-start h-full text-white text-center">
      <input
        ref={inputRef}
        type="file"
        accept=".cff"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Import Button */}
      <div className="w-full p-4">
        <Button
          variant="default"
          size="lg"
          className="w-full uppercase font-mono"
          onClick={openFilePicker}
        >
          <FileUpIcon />
          Import Event
        </Button>
      </div>

      {/* Table of Events */}
      {events.length > 0 && <EventTable />}
    </div>
  );
};

export default EventIndex;
