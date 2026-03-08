import { SetMetadata } from '@nestjs/common';

export const ResourceType = (type: string) => SetMetadata('resourceType', type);

