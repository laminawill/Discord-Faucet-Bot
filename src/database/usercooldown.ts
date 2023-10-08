import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class UserCoolDown extends BaseEntity {
	@PrimaryGeneratedColumn()
		id: number;

	@Column('timestamp')
		unlockTime: Date;

	@Column('text')
		userId: string;
}
