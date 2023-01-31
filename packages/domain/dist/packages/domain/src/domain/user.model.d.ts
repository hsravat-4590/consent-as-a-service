import { EmailModel } from './email.model';
export interface UserModel {
    id: NonNullable<string>;
    userType: 'org' | 'usr';
    firstName: string;
    lastName: string;
    email: EmailModel;
    telephone: string;
    userShaPassword: string;
}
