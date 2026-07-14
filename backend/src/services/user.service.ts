import { UserRepository } from '../repositories/user.repository';
import { StorageService } from './storage.service';
import { ApiError } from '../utils/ApiError';
import { RoleName, UserStatus } from '@prisma/client';
import { parseQueryParams, getPaginationMeta } from '../helpers/query.helper';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository = new UserRepository();
  private storageService = new StorageService();

  async getProfile(userId: string) {
    const user = await this.userRepository.findUserWithProfile(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const avatarUrl = await this.userRepository.getUserAvatar(userId);

    // Format response cleanly based on role
    const profile =
      user.role.name === RoleName.STUDENT
        ? user.student
        : user.role.name === RoleName.COUNSELOR
        ? user.counselor
        : user.role.name === RoleName.TEACHER
        ? user.teacher
        : user.role.name === RoleName.PARENT
        ? user.parent
        : null;

    return {
      id: user.id,
      email: user.email,
      role: user.role.name,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      avatarUrl,
      profile,
      createdAt: user.createdAt,
    };
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const roleName = user.role.name;

    if (roleName === RoleName.STUDENT) {
      await this.userRepository.updateStudentProfile(userId, data);
    } else if (roleName === RoleName.COUNSELOR) {
      await this.userRepository.updateCounselorProfile(userId, data);
    } else if (roleName === RoleName.TEACHER) {
      await this.userRepository.updateTeacherProfile(userId, data);
    } else if (roleName === RoleName.PARENT) {
      await this.userRepository.updateParentProfile(userId, data);
    } else {
      throw new ApiError(400, 'Tipe profil tidak didukung untuk diubah');
    }

    return this.getProfile(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    // 1. Check for old avatar public ID to delete it
    const oldPublicIdSetting = await prisma.settings.findUnique({
      where: {
        userId_key: {
          userId,
          key: 'avatar_public_id',
        },
      },
    });

    if (oldPublicIdSetting && oldPublicIdSetting.value) {
      // Delete old file from Cloudinary/Local storage asynchronously
      this.storageService.deleteFile(oldPublicIdSetting.value).catch((err) => {
        console.error('Failed to delete old avatar file', err);
      });
    }

    // 2. Upload new file
    const uploadResult = await this.storageService.uploadFile(file, 'avatars');

    // 3. Save new values in settings
    await prisma.$transaction([
      prisma.settings.upsert({
        where: { userId_key: { userId, key: 'avatar_url' } },
        update: { value: uploadResult.url },
        create: { userId, key: 'avatar_url', value: uploadResult.url },
      }),
      prisma.settings.upsert({
        where: { userId_key: { userId, key: 'avatar_public_id' } },
        update: { value: uploadResult.publicId },
        create: { userId, key: 'avatar_public_id', value: uploadResult.publicId },
      }),
    ]);

    return {
      avatarUrl: uploadResult.url,
    };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordMatch) {
      throw new ApiError(400, 'Password lama tidak sesuai');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(userId, newPasswordHash);

    return { message: 'Password berhasil diubah' };
  }

  async adminListUsers(query: any) {
    const { skip, take, page, limit, orderBy, search } = parseQueryParams(query);
    const filterRole = query.role as RoleName | undefined;

    const users = await this.userRepository.findManyWithFilters(
      filterRole,
      search,
      skip,
      take,
      orderBy
    );

    const total = await this.userRepository.countWithFilters(filterRole, search);
    const meta = getPaginationMeta(total, page, limit);

    // Fetch avatar urls in batch
    const userList = await Promise.all(
      users.map(async (u) => {
        const avatarUrl = await this.userRepository.getUserAvatar(u.id);
        const profile =
          u.role.name === RoleName.STUDENT
            ? u.student
            : u.role.name === RoleName.COUNSELOR
            ? u.counselor
            : u.role.name === RoleName.TEACHER
            ? u.teacher
            : u.role.name === RoleName.PARENT
            ? u.parent
            : null;

        return {
          id: u.id,
          email: u.email,
          role: u.role.name,
          status: u.status,
          isEmailVerified: u.isEmailVerified,
          avatarUrl,
          profile,
          createdAt: u.createdAt,
        };
      })
    );

    return {
      users: userList,
      meta,
    };
  }

  async adminUpdateUser(userId: string, data: { status?: UserStatus; roleName?: RoleName; isEmailVerified?: boolean }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.isEmailVerified !== undefined) updateData.isEmailVerified = data.isEmailVerified;

    if (data.roleName) {
      const role = await this.userRepository.findRoleByName(data.roleName);
      if (!role) {
        throw new ApiError(400, 'Role tidak terdaftar');
      }
      updateData.roleId = role.id;
    }

    await this.userRepository.updateUserCore(userId, updateData);
    return this.getProfile(userId);
  }

  async adminDeleteUser(userId: string, mode: 'soft' | 'hard' = 'soft') {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User tidak ditemukan');
    }

    // Delete avatar if exists
    const avatarPublicId = await prisma.settings.findUnique({
      where: { userId_key: { userId, key: 'avatar_public_id' } },
    });
    if (avatarPublicId && avatarPublicId.value) {
      this.storageService.deleteFile(avatarPublicId.value).catch(err => {
        console.error('Failed to delete avatar on user delete', err);
      });
    }

    if (mode === 'soft') {
      await this.userRepository.softDeleteUser(userId);
      return { message: 'Akun user berhasil dinonaktifkan (soft delete)' };
    } else {
      await this.userRepository.hardDeleteUser(userId);
      return { message: 'Akun user berhasil dihapus permanen dari database' };
    }
  }
}
