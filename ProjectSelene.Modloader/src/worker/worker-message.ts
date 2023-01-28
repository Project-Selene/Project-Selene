export interface RequestData {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: ReadableStream<Uint8Array>;
    clientId: string;
}

export type WorkerMessage = {
    type: 'fetch',
    request: RequestData,
    response: WritableStream,
} | {
    type: 'ok',
    id: number,
} | {
    type: 'error',
    id: number,
} | {
    type: 'request-resource',
    file: string,
    stream: WritableStream<Uint8Array>,
} | RegisterDir ;

export type RegisterDir = {
    type: 'register-dir',
    id: number,
    kind: 'handle',
    target: string,
    handle: string,
} | {
    type: 'register-dir',
    id: number,
    kind: 'indexed',
    target: string,
    key: string,
} | {
    type: 'register-dir',
    id: number,
    kind: 'on-demand',
    target: string,
    files: string[],
};