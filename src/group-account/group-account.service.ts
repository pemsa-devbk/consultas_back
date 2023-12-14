import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupAccount } from './entities/group-account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GroupAccountService {

    constructor(
        @InjectRepository(GroupAccount)
        private readonly groupAccountRepository: Repository<GroupAccount>
    ){}

    create(idAccount: number){
        return this.groupAccountRepository.create({
            idAccount
        })
    }

    createForGroup(idAccount: number){
        return this.groupAccountRepository.create({
            idAccount
        })
    }
}
