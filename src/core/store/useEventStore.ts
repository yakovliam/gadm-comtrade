import Comtrade from '@/lib/comtrade/comtrade';
import { create } from 'zustand';

export type Event = Comtrade;

type EventState = {
    events: Event[];
    addEvent: (event: Event) => void;
};

const useEventStore = create<EventState>((set) => ({
    events: [],
    addEvent: (event: Event) => set((state) => ({ events: [...state.events, event] })),
}));

export default useEventStore;