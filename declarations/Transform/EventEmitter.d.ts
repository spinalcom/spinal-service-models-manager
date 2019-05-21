declare type EventFunction = (event: any) => {};
declare class EventEmitter {
    events: {
        [key: string]: EventFunction[];
    };
    on(eventName: string, func: EventFunction): void;
    emit(eventName: string, option: {
        [key: string]: string;
    }): void;
}
