import { CreateTripSchema } from './create-trip.dto';

export const UpdateTripSchema = CreateTripSchema.partial();
export type UpdateTripDto = Partial<import('./create-trip.dto').CreateTripDto>;
