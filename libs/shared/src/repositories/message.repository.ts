import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageEntity } from '../entities/message.entity';
import { MessageRepositoryInterface } from '../interfaces/message.repository.interface';
import { BaseAbstractRepository } from './base/base.abstract.repository';

@Injectable()
export class MessageRepository
  extends BaseAbstractRepository<MessageEntity>
  implements MessageRepositoryInterface
{
  constructor(
    @InjectRepository(MessageEntity)
    private readonly MessageEntity: Repository<MessageEntity>,
  ) {
    super(MessageEntity);
  }
}
