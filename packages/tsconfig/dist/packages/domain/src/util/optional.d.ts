export declare class Optional<T> {
    private readonly value;
    private static readonly EMPTY;
    private constructor();
    isPresent(): boolean;
    get(): T;
    orElse(other: T): T;
    orElseGet(supplier: () => Promise<T>): Promise<T>;
    orElseRun(runnable: () => Promise<void>): Promise<T | void>;
    static of<T>(item: T): Optional<T>;
    static ofNullable<T>(item: T | null | undefined): Optional<T>;
    static empty<T>(): Optional<T>;
}
//# sourceMappingURL=optional.d.ts.map