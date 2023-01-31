export type ValidateErrorHandlers = {
    errorMessage: string;
    errorException: Error;
};
export declare const ValidateState: (check: () => boolean, errorHandler: Partial<ValidateErrorHandlers>) => void;
export interface Comparable<T> {
    equals(other: T): boolean;
}
export declare const ValidateEquals: <T extends Comparable<T>>(values: [T, T] | T[], errorHandler: Partial<ValidateErrorHandlers>) => void;
