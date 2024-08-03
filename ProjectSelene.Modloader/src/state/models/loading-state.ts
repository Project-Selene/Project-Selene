export type LoadingState<T> = {
    loading?: undefined; //Not yet loaded
    failed?: undefined;
    data?: undefined;
    error?: undefined;
} | {
    loading: true; //Loading
    failed?: undefined;
    data?: undefined;
    error?: undefined;
} | {
    loading: false; //Loaded successfully
    failed?: undefined;
    data: T;
    error?: undefined;
} | {
    loading?: undefined; //Failed to load
    failed: true;
    data?: T;
    error: unknown;
};