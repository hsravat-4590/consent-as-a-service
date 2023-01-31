export declare class EmailModel {
    _email: string;
    private regexp;
    constructor(email: string);
    get email(): string;
    set email(email: string);
    private checkAndSet;
}
export declare class InvalidEmailAddressError extends Error {
}
//# sourceMappingURL=email.model.d.ts.map