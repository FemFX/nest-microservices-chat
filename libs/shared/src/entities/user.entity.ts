import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,ManyToMany
} from 'typeorm';
import { FriendRequestEntity } from './friend-request.entity';
import { MessageEntity } from './message.entity';
import { ConversationEntity } from './conversation.entity';


@Entity('user')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    name: 'first_name',
  })
  firstName: string;
  @Column({
    name: 'last_name',
  })
  lastName: string;
  @Column({
    unique: true,
  })
  email: string;
  @Column({
    select: false,
  })
  password: string;
  @OneToMany(() => FriendRequestEntity, (friend) => friend.creator)
  friendRequestCreator: FriendRequestEntity[];
  @OneToMany(() => FriendRequestEntity, (friend) => friend.receiver)
  friendRequestReceiver: FriendRequestEntity[];
  @ManyToMany(
    () => ConversationEntity,
    (conversationEntity) => conversationEntity.users,
  )
  conversations: ConversationEntity[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
  messages: MessageEntity[];
}
