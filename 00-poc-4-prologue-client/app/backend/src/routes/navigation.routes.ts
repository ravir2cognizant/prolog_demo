import { Router } from 'express';
import { z } from 'zod';
import { ah } from '../controllers/asyncHandler.js';
import { documented } from '../docs/registry.js';
import { unauthorised, serverError } from '../docs/responses.js';
import { listNavigationMenu } from '../services/navigation.service.js';

const NavItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  route: z.string(),
  level: z.number(),
  parentId: z.string().nullable(),
  alertState: z.boolean(),
  enabled: z.boolean(),
});

const NavigationMenuResponse = z.object({ items: z.array(NavItemSchema) });

export const navigationRouter = Router();

documented({
  method: 'get',
  path: '/navigation/menu',
  tag: 'navigation',
  summary: 'ED-001: Return the GL module navigation tree for the authenticated user',
  auth: 'bearer',
  responses: {
    200: { description: 'Navigation menu', schema: NavigationMenuResponse },
    401: unauthorised,
    500: serverError,
  },
});

navigationRouter.get(
  '/navigation/menu',
  ah(() => ({ items: listNavigationMenu() })),
);
