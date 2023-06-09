import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('friend-request')
export class FriendRequestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.friendRequestCreator)
  creator: UserEntity;
  @ManyToOne(() => UserEntity, (user) => user.friendRequestReceiver)
  receiver: UserEntity;
}
