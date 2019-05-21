declare type EventFunction = (event: any) => {};
declare class EventsEmitter {
    events: {
        [key: string]: EventFunction[];
    };
    on(eventName: string, func: EventFunction): void;
    emit(eventName: string, option: {
        [key: string]: string;
    }): void;
}
