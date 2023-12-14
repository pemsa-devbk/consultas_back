import { Controller } from '@nestjs/common';
import { GroupAccountService } from './group-account.service';

@Controller('group-account')
export class GroupAccountController {
  constructor(private readonly groupAccountService: GroupAccountService) {}
}
