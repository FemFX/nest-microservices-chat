import { ConversationsRepository, MessageRepository } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NewMessageDto } from './dto/new-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject('ConversationsRepositoryInterface')
    private readonly conversationsRepository: ConversationsRepository,
    @Inject('MessagesRepositoryInterface')
    private readonly messageRepository: MessageRepository,
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  private async getUser(id: number) {
    const ob$ = this.authService.send(
      {
        cmd: 'get-user',
      },
      {
        id,
      },
    );

    const user = await firstValueFrom(ob$).catch((err) => console.error(err));

    return user;
  }
  async getConversations(userId: number) {
    const allConversations =
      await this.conversationsRepository.findWithRelations({
        relations: ['users'],
      });

    const userConversations = allConversations.filter((conversation) => {
      const userIds = conversation.users.map((user) => user.id);
      return userIds.includes(userId);
    });

    return userConversations.map((conversation) => ({
      id: conversation.id,
      userIds: (conversation?.users ?? []).map((user) => user.id),
    }));
  }
  async createConversation(userId: number, friendId: number) {
    const user = await this.getUser(userId);
    const friend = await this.getUser(friendId);

    if (!user || !friend) return;

    const conversation = await this.conversationsRepository.findConversation(
      userId,
      friendId,
    );

    if (!conversation) {
      return await this.conversationsRepository.save({
        users: [user, friend],
      });
    }

    return conversation;
  }

  async createMessage(userId: number, newMessage: NewMessageDto) {
    const user = await this.getUser(userId);

    if (!user) return;

    const conversation = await this.conversationsRepository.findByCondition({
      where: [{ id: newMessage.conversationId }],
      relations: ['users'],
    });

    if (!conversation) return;

    return await this.messageRepository.save({
      message: newMessage.message,
      user,
      conversation,
    });
  }
}
