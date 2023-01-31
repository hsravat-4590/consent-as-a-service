export interface ConsentDataSchemaModel {
    id: NonNullable<string>;
    title: string;
    description: string;
    dataPoints: Array<DataPoint>;
}
export type DataPoint = {
    name: string;
    userDescription: string;
    control: Control;
};
export type MinMax = {
    min: number;
    max: number;
};
export type Control = 'BOOLEAN' | 'SHORT_STR' | 'LONG_STR' | 'NUMBER' | 'FLOAT' | 'DATE' | 'DATE_TIME' | 'TIME' | 'EMAIL' | 'PHONE_NUMBER';
//# sourceMappingURL=consent-data-schema.model.d.ts.map