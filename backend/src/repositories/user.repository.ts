import { prisma } from '../utils/prisma';
import { User, Role, RoleName, UserStatus, Student, Counselor, Teacher, Parent } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  roleName: RoleName;
  firstName: string;
  lastName: string;
  phone?: string;
}

export type UserWithProfile = User & {
  role: Role;
  student?: Student | null;
  counselor?: Counselor | null;
  teacher?: Teacher | null;
  parent?: Parent | null;
};

export class UserRepository {
  async findByEmail(email: string): Promise<(User & { role: Role }) | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  }

  async findById(id: string): Promise<(User & { role: Role }) | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  }

  async findRoleByName(name: RoleName): Promise<Role | null> {
    return prisma.role.findUnique({
      where: { name },
    });
  }

  async createUserWithProfile(data: CreateUserData): Promise<User & { role: Role }> {
    const role = await this.findRoleByName(data.roleName);
    if (!role) {
      throw new Error(`Role ${data.roleName} does not exist in the database.`);
    }

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: data.passwordHash,
          roleId: role.id,
          status: UserStatus.PENDING,
        },
        include: { role: true },
      });

      if (data.roleName === RoleName.STUDENT) {
        await tx.student.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        });
      } else if (data.roleName === RoleName.COUNSELOR) {
        await tx.counselor.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        });
      } else if (data.roleName === RoleName.TEACHER) {
        await tx.teacher.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
          },
        });
      } else if (data.roleName === RoleName.PARENT) {
        await tx.parent.create({
          data: {
            id: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
          },
        });
      }

      return user;
    });
  }

  async updateUserVerification(id: string, isVerified: boolean): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        isEmailVerified: isVerified,
        status: isVerified ? UserStatus.ACTIVE : UserStatus.PENDING,
      },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  // Phase 4 Extensions
  async findUserWithProfile(id: string): Promise<UserWithProfile | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        student: true,
        counselor: true,
        teacher: true,
        parent: true,
      },
    });
  }

  async updateStudentProfile(userId: string, data: any): Promise<Student> {
    const { firstName, lastName, ...profileData } = data;

    return prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.student.update({
          where: { id: userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        });
      }

      return tx.student.update({
        where: { id: userId },
        data: profileData,
      });
    });
  }

  async updateCounselorProfile(userId: string, data: any): Promise<Counselor> {
    const { firstName, lastName, ...profileData } = data;

    return prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.counselor.update({
          where: { id: userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        });
      }

      return tx.counselor.update({
        where: { id: userId },
        data: profileData,
      });
    });
  }

  async updateTeacherProfile(userId: string, data: any): Promise<Teacher> {
    const { firstName, lastName, ...profileData } = data;

    return prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.teacher.update({
          where: { id: userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        });
      }

      return tx.teacher.update({
        where: { id: userId },
        data: profileData,
      });
    });
  }

  async updateParentProfile(userId: string, data: any): Promise<Parent> {
    const { firstName, lastName, ...profileData } = data;

    return prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.parent.update({
          where: { id: userId },
          data: {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
        });
      }

      return tx.parent.update({
        where: { id: userId },
        data: profileData,
      });
    });
  }

  async updateUserAvatar(userId: string, url: string): Promise<User> {
    // Save avatar URL in the core Settings or user profiles.
    // For convenience and architectural excellence, we can save the avatar url directly in the User profiles.
    // Wait! Let's check our schema: Did Student, Counselor, Teacher BK, Parent have avatarUrl?
    // Let's check schema.prisma... wait, we did not include avatarUrl inside Student/Counselor/Teacher/Parent profile models!
    // But wait! We do have a `File` model and we can store avatar as a setting, or let's double check if we can write the url to a setting.
    // Actually, setting setting `avatar_url` is perfect, or we can use the `Settings` table where key='avatar_url' and value=url.
    // Let's use `Settings` table! It matches our schema beautifully and keeps it modular!
    return prisma.settings.upsert({
      where: {
        userId_key: {
          userId,
          key: 'avatar_url',
        },
      },
      update: { value: url },
      create: {
        userId,
        key: 'avatar_url',
        value: url,
      },
    }).then(() => prisma.user.findUniqueOrThrow({ where: { id: userId } }));
  }

  async getUserAvatar(userId: string): Promise<string | null> {
    const setting = await prisma.settings.findUnique({
      where: {
        userId_key: {
          userId,
          key: 'avatar_url',
        },
      },
    });
    return setting ? setting.value : null;
  }

  async updateUserCore(userId: string, data: { status?: UserStatus; isEmailVerified?: boolean; roleId?: string }): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async softDeleteUser(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED },
    });
  }

  async hardDeleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  // Admin Query Filters
  buildWhereClause(roleName?: RoleName, search?: string) {
    const where: any = {};
    if (roleName) {
      where.role = { name: roleName };
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { student: { firstName: { contains: search, mode: 'insensitive' } } },
        { student: { lastName: { contains: search, mode: 'insensitive' } } },
        { counselor: { firstName: { contains: search, mode: 'insensitive' } } },
        { counselor: { lastName: { contains: search, mode: 'insensitive' } } },
        { teacher: { firstName: { contains: search, mode: 'insensitive' } } },
        { teacher: { lastName: { contains: search, mode: 'insensitive' } } },
        { parent: { firstName: { contains: search, mode: 'insensitive' } } },
        { parent: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    return where;
  }

  async findManyWithFilters(
    roleName: RoleName | undefined,
    search: string | undefined,
    skip: number,
    take: number,
    orderBy: any
  ): Promise<UserWithProfile[]> {
    const where = this.buildWhereClause(roleName, search);
    return prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        role: true,
        student: true,
        counselor: true,
        teacher: true,
        parent: true,
      },
    });
  }

  async countWithFilters(roleName?: RoleName, search?: string): Promise<number> {
    const where = this.buildWhereClause(roleName, search);
    return prisma.user.count({ where });
  }
}
