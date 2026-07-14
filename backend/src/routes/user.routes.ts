import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { auth } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validate';
import { uploadAvatar } from '../middleware/upload.middleware';
import {
  updateStudentProfileSchema,
  updateCounselorProfileSchema,
  updateTeacherProfileSchema,
  updateParentProfileSchema,
  adminUpdateUserSchema,
  changePasswordSchema,
} from '../validations/user.validation';
import { RoleName } from '@prisma/client';

const router = Router();
const controller = new UserController();

// --- Profile Routes (Authenticated Users) ---
router.get('/me', auth, controller.getProfile);
router.post('/me/avatar', auth, uploadAvatar, controller.uploadAvatar);
router.put('/me/change-password', auth, validate(changePasswordSchema), controller.changePassword);

// Profile updates per role
router.put(
  '/me/student',
  auth,
  authorize(RoleName.STUDENT),
  validate(updateStudentProfileSchema),
  controller.updateProfile
);
router.put(
  '/me/counselor',
  auth,
  authorize(RoleName.COUNSELOR),
  validate(updateCounselorProfileSchema),
  controller.updateProfile
);
router.put(
  '/me/teacher',
  auth,
  authorize(RoleName.TEACHER),
  validate(updateTeacherProfileSchema),
  controller.updateProfile
);
router.put(
  '/me/parent',
  auth,
  authorize(RoleName.PARENT),
  validate(updateParentProfileSchema),
  controller.updateProfile
);

// --- Admin Management Routes (Admin Only) ---
router.get('/admin/users', auth, authorize(RoleName.ADMIN), controller.adminListUsers);
router.get('/admin/users/:id', auth, authorize(RoleName.ADMIN), controller.adminGetUser);
router.put(
  '/admin/users/:id',
  auth,
  authorize(RoleName.ADMIN),
  validate(adminUpdateUserSchema),
  controller.adminUpdateUser
);
router.delete('/admin/users/:id', auth, authorize(RoleName.ADMIN), controller.adminDeleteUser);

export default router;
