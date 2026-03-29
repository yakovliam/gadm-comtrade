import useEventStore from "@/core/store/useEventStore";

const EventIndex = () => {
    const events = useEventStore((state) => state.events);
    const addEvent = useEventStore((state) => state.addEvent);

    return (
        <div className="flex flex-col items-center justify-center h-full text-white text-center">
            {events.length === 0 && (
                <div className="mb-4">
                    <p>No events found.</p>
                </div>
            )}
            {events.map((event, index) => (
                <div key={index} className="mb-4">
                    <h2 className="text-xl font-bold">{event.id}</h2>
                    <p>{event.config.stationName}</p>
                </div>
            ))}
        </div>
    );
};

export default EventIndex;