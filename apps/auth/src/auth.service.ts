import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { NewUserDto } from './dto/new-user';
import { ExistingUserDto } from './dto/existing-user';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  UserRepositoryInterface,
  UserEntity,
  UserJwt,
  FriendRequestEntity,
  FriendRequestRepositoryInterface,
} from '@app/shared';

@Injectable()
export class AuthService {
  constructor(
    // @InjectRepository(UserEntity)
    // private readonly userRepository: Repository<UserEntity>,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('FriendRequestRepositoryInterface')
    private readonly friendRequestRepository: FriendRequestRepositoryInterface,
    private readonly jwtService: JwtService,
  ) {}

  async getUsers(): Promise<UserEntity[]> {
    return this.userRepository.findAll({});
  }
  async getUserById(id: number): Promise<UserEntity> {
    return await this.userRepository.findOneById(id);
  }
  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findByCondition({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
  }
  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneById(id);
  }
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async doesPasswordMatch(
    password: string,
    hashedPass: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPass);
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);

    const doesUserExists = !!user;

    if (!doesUserExists) return null;
    console.log(password, user.password);

    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );

    if (!doesPasswordMatch) return null;

    return user;
  }

  async register(newUser: Readonly<NewUserDto>) {
    const { firstName, lastName, email, password } = newUser;

    const isUserExists = await this.findByEmail(email);

    if (isUserExists) {
      throw new ConflictException('An account with that email already exists!');
    }

    const hashedPass = await this.hashPassword(password);

    const savedUser = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPass,
    });
    // delete savedUser.password;
    const { password: userPass, ...user } = savedUser;
    return user;
  }
  async login(existingUser: Readonly<ExistingUserDto>) {
    const { email, password } = existingUser;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    delete user.password;

    const jwt = await this.jwtService.signAsync({ user });

    return {
      token: jwt,
      user,
    };
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException();
    }
    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);

      return { user, exp };
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;
    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (err) {
      throw new BadRequestException();
    }
  }
  async addFriend(
    userId: number,
    friendId: number,
  ): Promise<FriendRequestEntity> {
    const creator = await this.findById(userId);
    const receiver = await this.findById(friendId);

    return await this.friendRequestRepository.save({ creator, receiver });
  }
  async getFriends(userId: number): Promise<FriendRequestEntity[]> {
    const creator = await this.findById(userId);

    return await this.friendRequestRepository.findWithRelations({
      where: [{ creator } as any, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }
  async getFriendsList(userId: number) {
    const friendRequests = await this.getFriends(userId);

    if (!friendRequests) return [];

    const friends = friendRequests.map((friendRequest) => {
      const isUserCreator = userId === friendRequest.creator.id;
      const friendDetails = isUserCreator
        ? friendRequest.receiver
        : friendRequest.creator;

      const { id, firstName, lastName, email } = friendDetails;

      return { id, firstName, lastName, email };
    });

    return friends;
  }
}
