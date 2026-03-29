import Comtrade from "@/lib/comtrade/comtrade";
import { create } from "zustand";

export type Event = Comtrade;

type EventState = {
  events: Event[];
  addEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
};

const useEventStore = create<EventState>((set) => ({
  events: [],
  addEvent: (event: Event) =>
    set((state) => ({ events: [...state.events, event] })),
  deleteEvent: (id: string) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
}));

export default useEventStore;
