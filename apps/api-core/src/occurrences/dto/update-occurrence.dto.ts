import { CreateOccurrenceSchema } from './create-occurrence.dto';

export const UpdateOccurrenceSchema = CreateOccurrenceSchema.partial();
export type UpdateOccurrenceDto = Partial<import('./create-occurrence.dto').CreateOccurrenceDto>;
