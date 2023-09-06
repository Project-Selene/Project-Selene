export interface RequestData {
    method: string;
    url: string;
    headers: Record<string, string>;
    body: ReadableStream<Uint8Array>;
    clientId: string;
}

export interface Fetch {
    request: RequestData,
    response: WritableStream,
}

export type RegisterDir = {
    kind: 'handle',
    target: string,
    handle: string,
} | {
    kind: 'indexed',
    target: string,
    key: string,
} | {
    kind: 'on-demand',
    target: string,
    files: string[],
} | {
    kind: 'zip',
    target: string,
    source: string,
} | {
    kind: 'link',
    target: string,
    source: string,
} | {
    kind: 'http',
    target: string,
    source: string,
} | {
    kind: 'fs',
    target: string,
    source: string,
};

export interface RegisterPatches {
    kind: 'json' | 'raw',
    patches: {
        target: string,
        source: string,
    }[]
}
export interface UnregisterPatches {
    kind: 'json' | 'raw',
    patches: {
        target: string,
        source: string,
    }[]
}
export interface RegisterFs {
    channel: MessagePort,
}