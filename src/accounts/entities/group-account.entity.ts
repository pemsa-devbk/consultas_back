import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CustomGroup } from "./custom-group.entity";


@Entity('group_accounts')
export class GroupAccount{

    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    idAccount: number;

    @ManyToOne(
        () => CustomGroup,
        ( customGroup ) => customGroup.accounts,
        {onDelete: 'CASCADE'}
    )
    group: CustomGroup;
}