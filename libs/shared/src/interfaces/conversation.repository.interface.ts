import { BaseInterfaceRepository } from '@app/shared';

import { ConversationEntity } from '../entities/conversation.entity';

export interface ConversationRepositoryInterface
  extends BaseInterfaceRepository<ConversationEntity> {
  findConversation(
    userId: number,
    friendId: number,
  ): Promise<ConversationEntity | undefined>;
}
