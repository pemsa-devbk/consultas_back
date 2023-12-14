import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Company } from '../../company/entities/company.entity';
import { UserAccounts } from "../../user-accounts/entities/user-accounts.entity";
import { CustomGroup } from "../../custom-group/entities/custom-group.entity";

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
        (userCreator) => userCreator.usersCreated,
        {nullable: true, onDelete: 'CASCADE', createForeignKeyConstraints: false}
    )
    createdBy: User;

    @OneToMany(
        () => User,
        (user) => user.createdBy,
    )
    usersCreated: User[];

    @OneToMany(
        () => UserAccounts,
        (userAccount) => userAccount.user,
    )
    accounts: UserAccounts[];

    @OneToMany(
        () => CustomGroup,
        (customGroup) => customGroup.user,
    )
    groups: CustomGroup[];


    @ManyToOne(
        () => Company,
        (company) => company.users,
        {onDelete: 'CASCADE'}
    )
    company: Company;

}
