import { User } from "../../user/entities";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_accounts')
export class UserAccounts {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    idAccount: number;

    @Column('int')
    typeAccount: number;
    
    @ManyToOne(
        () => User,
        ( user ) => user.accounts,
        {onDelete: 'CASCADE'}
    )
    user: User;
}
