import { CreateVehicleSchema } from './create-vehicle.dto';

export const UpdateVehicleSchema = CreateVehicleSchema.partial();
export type UpdateVehicleDto = Partial<import('./create-vehicle.dto').CreateVehicleDto>;
