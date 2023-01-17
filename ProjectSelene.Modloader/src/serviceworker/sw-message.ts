
export type SWMessage = {
    type: 'workers',
    workers: MessagePort[],
} | {
    type: 'filter',
    start: string,
};

export type SWMessageResponse = {
    type: 'ok',
    sourceId: string,
} | {
    type: 'error',
    sourceId: string,
    message: string,
};