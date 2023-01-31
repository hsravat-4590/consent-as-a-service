import { LocalDateTime } from '@js-joda/core';
export interface ConsentDataModel {
    id: NonNullable<string>;
    dataTypeRef: string;
    dataRef: string;
    hash: string;
    sizeBytes: number;
    name: string;
    dateCreated: LocalDateTime;
}
//# sourceMappingURL=consent-data.model.d.ts.map