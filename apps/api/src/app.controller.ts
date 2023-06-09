import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard, UserInterceptor, UserRequest } from '@app/shared';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @Get()
  getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }
  // @UseGuards(AuthGuard)
  @Get('presence')
  getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }
  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      {
        cmd: 'register',
      },
      {
        firstName,
        lastName,
        email,
        password,
      },
    );
  }
  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      {
        email,
        password,
      },
    );
  }
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req?.user) {
      throw new BadRequestException();
    }
    return this.authService.send(
      { cmd: 'add-friend' },
      {
        userId: req.user.id,
        friendId,
      },
    );
  }
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friends')
  async getFriends(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: req.user.id,
      },
    );
  }
}
