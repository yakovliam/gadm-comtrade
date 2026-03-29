import useEventStore from "@/core/store/useEventStore";
import { Button } from "@/components/ui/button";
import useUploadCff from "./useUploadCff";

const EventIndex = () => {
  const events = useEventStore((state) => state.events);
  const { inputRef, openFilePicker, handleFileChange } = useUploadCff();

  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center">
      <input
        ref={inputRef}
        type="file"
        accept=".cff"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button variant="default" size="lg" onClick={openFilePicker}>
        Upload CFF
      </Button>

      {events.length === 0 && (
        <div className="mt-4">
          <p>No events found.</p>
        </div>
      )}
      {events.map((event, index) => (
        <div key={index} className="mt-4">
          <h2 className="text-xl font-bold">{event.id}</h2>
          <p>{event.config.stationName}</p>
        </div>
      ))}
    </div>
  );
};

export default EventIndex;
