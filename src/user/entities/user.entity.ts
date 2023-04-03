import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { UserAccounts } from '../../accounts/entities/user-accounts.entity';
import { CustomGroup } from '../../accounts/entities/custom-group.entity';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar',{
        length: 200
    })
    fullName: string;

    @Column('varchar', {
        unique: true,
        length: 100,
    })
    email: string;

    @Column('bit', {
        default: false
    })
    termsAndConditions: true;
    
    @Column('datetime2', {
        nullable: true,
    })
    dateAcceptTerms: Date;

    @Column('bit', {
        default: true
    })
    isActive: boolean;

    @Column('simple-array', {
        default: ['user']
    })
    roles: string[];

    @Column('varchar', {
        select: false,
        length: 300
    })
    password: string;

    

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(
        () => User,
        (user) => user.usersCreated,
        {nullable: true}
    )
    createdBy: User;

    @OneToMany(
        () => User,
        (user) => user.createdBy,
        {nullable: true, onDelete: "CASCADE"}
    )
    usersCreated?: User[];

    @OneToMany(
        () => UserAccounts,
        (userAccount) => userAccount.user,
        { cascade: true }
    )
    accounts?: UserAccounts[];

    @OneToMany(
        () => CustomGroup,
        (customGroup) => customGroup.user,
        { cascade: true }
    )
    groups: CustomGroup[];

}
