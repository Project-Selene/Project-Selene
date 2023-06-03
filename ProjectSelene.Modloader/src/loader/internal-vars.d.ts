declare interface ProjectSeleneGlobal {
    gameReadyCallback: () => void;
    symbol: symbol;
    classes: Record<string | symbol, unknown>;
    functions: Record<string | symbol, (...args: unknown[]) => unknown>;
    consts: Record<string | symbol, unknown>;
    lets: Record<string | symbol, { getter: () => unknown, setter: (value: unknown) => void }>;
}

declare const __projectSelene: ProjectSeleneGlobal;