import { User } from "../../user/entities";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GroupAccount } from "../../group-account/entities/group-account.entity";

@Entity('custom_group')
export class CustomGroup {

    @PrimaryGeneratedColumn()
    idGroup: number;

    @Column('varchar', {
        length: 100
    })
    name: string;

    @ManyToOne(
        () => User,
        (user) => user.groups,
        {onDelete: 'CASCADE'}
    )
    user: User;

    @OneToMany(
        () => GroupAccount,
        (groupAccount) => groupAccount.group,
    )
    accounts?: GroupAccount[];
}