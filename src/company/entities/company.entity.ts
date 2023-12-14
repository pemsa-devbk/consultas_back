import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('company')
export class Company {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'varchar',
        length: 150
    })
    name: string;

    @Column({
        type: 'varchar',
        length: '6'
    })
    shortName: string;

    @Column({
        nullable: true,
        type: 'varchar',
        length: '7'
    })
    primaryColor: string;

    @Column({
        nullable: true,
        type: 'varchar',
        length: '150'
    })
    logoPath: string;

    @Column({
        type: 'varchar',
        length: '80'
    })
    serviceUrl: string;

    @Column({
        type: 'int'
    })
    portService: number;

    @Column({
        default: false
    })
    serviceIsActive: boolean;

    // * Relations

    @OneToMany(
        () => User,
        (user) => user.company,
    )
    users: User[];

}
