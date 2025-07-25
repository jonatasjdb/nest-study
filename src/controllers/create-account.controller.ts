import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'
import { hash } from 'bcryptjs'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'
import { z } from 'zod'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccounBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccounBodySchema) {
    const { name, email, password } = body

    const emailAlreadyExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (emailAlreadyExists) {
      throw new ConflictException('User with same e-mail already exists!')
    }

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: await hash(password, 8),
      },
    })
  }
}
