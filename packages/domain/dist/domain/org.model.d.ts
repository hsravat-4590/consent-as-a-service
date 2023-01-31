import { EmailModel } from './email.model';
export interface OrgModel {
    orgId: NonNullable<string>;
    email: EmailModel;
    displayName: string;
}
