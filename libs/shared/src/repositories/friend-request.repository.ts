import { Injectable } from '@nestjs/common';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequestEntity } from '../entities/friend-request.entity';
import { FriendRequestRepositoryInterface } from '../interfaces/friend-request.repository.interface';

@Injectable()
export class FriendRequestRepository
  extends BaseAbstractRepository<FriendRequestEntity>
  implements FriendRequestRepositoryInterface
{
  constructor(
    @InjectRepository(FriendRequestEntity)
    private readonly FriendRequestRepository: Repository<FriendRequestEntity>,
  ) {
    super(FriendRequestRepository);
  }
}
