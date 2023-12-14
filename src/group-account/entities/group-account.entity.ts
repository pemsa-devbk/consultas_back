import { CustomGroup } from "../../custom-group/entities/custom-group.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity('group_accounts')
export class GroupAccount {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    idAccount: number;

    @ManyToOne(
        () => CustomGroup,
        (customGroup) => customGroup.accounts,
        {onDelete: 'CASCADE'}
    )
    group: CustomGroup;
}