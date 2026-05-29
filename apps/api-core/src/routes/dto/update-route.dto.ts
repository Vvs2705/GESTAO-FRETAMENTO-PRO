import { CreateRouteSchema } from './create-route.dto';

export const UpdateRouteSchema = CreateRouteSchema.partial();
export type UpdateRouteDto = Partial<import('./create-route.dto').CreateRouteDto>;
