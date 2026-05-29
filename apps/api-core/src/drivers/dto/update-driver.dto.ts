import { CreateDriverSchema } from './create-driver.dto';

export const UpdateDriverSchema = CreateDriverSchema.partial();
export type UpdateDriverDto = Partial<import('./create-driver.dto').CreateDriverDto>;
