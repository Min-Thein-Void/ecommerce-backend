import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,

        userProfile: {
          create: {},
        },
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,

        userProfile: {
          select: {
            id: true,
            image: true,
            phone: true,
            address: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const { name, phone, address } = dto;

    return this.prisma.$transaction(async (tx) => {
      // Update User table
      if (name !== undefined) {
        await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            name,
          },
        });
      }

      // Update UserProfile table
      await tx.userProfile.upsert({
        where: {
          userId,
        },

        update: {
          phone,
          address,
        },

        create: {
          userId,
          phone,
          address,
        },
      });

      // Return updated profile
      return tx.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,

          userProfile: {
            select: {
              id: true,
              image: true,
              phone: true,
              address: true,
            },
          },
        },
      });
    });
  }

  async updateProfileImage(userId: number, file: Express.Multer.File) {
    return this.prisma.userProfile.upsert({
      where: {
        userId,
      },

      update: {
        image: file.filename,
      },

      create: {
        userId,
        image: file.filename,
      },

      select: {
        id: true,
        image: true,
        phone: true,
        address: true,
      },
    });
  }
}
