import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { idParamSchema } from '../validators/common.validator';
import { userBodySchema, userListQuerySchema } from '../validators/user.validator';
import * as userService from '../services/user.service';

export const userRouter = Router();

userRouter.get(
  '/',
  validate(userListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const params = parsePagination(req.query);
    const result = await userService.listUsers(params);
    res.json({ success: true, ...result });
  }),
);

userRouter.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json({ success: true, data: user });
  }),
);

userRouter.post(
  '/',
  validate(userBodySchema),
  asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json({ success: true, data: user });
  }),
);

userRouter.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(userBodySchema),
  asyncHandler(async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, data: user });
  }),
);

userRouter.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  }),
);
