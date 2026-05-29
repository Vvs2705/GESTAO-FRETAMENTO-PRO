import { CreateClientSchema, CreateContractSchema } from './create-client.dto';

export const UpdateClientSchema = CreateClientSchema.partial();
export type UpdateClientDto = Partial<import('./create-client.dto').CreateClientDto>;

export const UpdateContractSchema = CreateContractSchema.partial();
export type UpdateContractDto = Partial<import('./create-client.dto').CreateContractDto>;
