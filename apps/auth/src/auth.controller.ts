import { Controller, Inject, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  MessagePattern,
  Ctx,
  RmqContext,
  Payload,
} from '@nestjs/microservices';
import { SharedService } from '@app/shared';
import { NewUserDto } from './dto/new-user';
import { ExistingUserDto } from './dto/existing-user';
import { JwtGuard } from './jwt.guard';

@Controller()
export class AuthController {
  constructor(
    @Inject('AuthServiceInterface') private readonly authService: AuthService,
    @Inject('SharedServiceInterface')
    private readonly sharedService: SharedService, // private readonly authService: AuthService, // private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUsers();
  }

  @MessagePattern({ cmd: 'get-user' })
  async getUser(@Ctx() context: RmqContext, @Payload() user: { id: number }) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUserById(user.id);
  }

  @MessagePattern({ cmd: 'register' })
  async register(@Ctx() context: RmqContext, @Payload() newUser: NewUserDto) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.register(newUser);
  }

  @MessagePattern({ cmd: 'login' })
  async login(
    @Ctx() context: RmqContext,
    @Payload() existingUser: ExistingUserDto,
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.login(existingUser);
  }

  @MessagePattern({ cmd: 'verify-jwt' })
  @UseGuards(JwtGuard)
  async verifyJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.verifyJwt(payload.jwt);
  }

  @MessagePattern({ cmd: 'decode-jwt' })
  async decodeJwt(
    @Ctx() context: RmqContext,
    @Payload() payload: { jwt: string },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getUserFromHeader(payload.jwt);
  }

  @MessagePattern({ cmd: 'add-friend' })
  async addFriend(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number; friendId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.addFriend(payload.userId, payload.friendId);
  }
  @MessagePattern({ cmd: 'get-friends' })
  async getFriends(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number; friendId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getFriends(payload.userId);
  }
  @MessagePattern({ cmd: 'get-friends-list' })
  async getFriendsList(
    @Ctx() context: RmqContext,
    @Payload() payload: { userId: number; friendId: number },
  ) {
    this.sharedService.acknowledgeMessage(context);

    return this.authService.getFriendsList(payload.userId);
  }
}
