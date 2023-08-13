export interface RequestData {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: ReadableStream<Uint8Array>;
    clientId: string;
}

export type WorkerMessage = {
    type: 'fetch',
    id: number,
    request: RequestData,
    response: WritableStream,
} | {
    type: 'ok',
    id: number,
} | {
    type: 'error',
    id: number,
} | {
    type: 'response',
    id: number,
    response: ResponseInit,
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
} | {
    type: 'register-dir',
    id: number,
    kind: 'zip',
    target: string,
    source: string,
} | {
    type: 'register-dir',
    id: number,
    kind: 'link',
    target: string,
    source: string,
} | {
    type: 'register-dir',
    id: number,
    kind: 'http',
    target: string,
    source: string,
} | {
    type: 'register-patches' | 'unregister-patches',
    id: number,
    kind: 'json',
    patches: {
        target: string,
        source: string,
    }[]
};