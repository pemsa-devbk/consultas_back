import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { Auth, GetUser } from '../auth/decorators';
import { ReportsService } from './reports.service';
import { User } from '../user/entities';
import { ReportDTO, ReportDatesDTO} from '../common/dto';


@Controller({
    version: '1',
    path: 'reports'
})
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Auth()
  @Post('batery')
  async reportBatery(
    @Body() reportWitOutDates: ReportDTO,
    @GetUser() user: User
  ) {
    if (reportWitOutDates.typeAccount > 1 && reportWitOutDates.accounts.length > 1) {
      throw new BadRequestException('Para consultas en grupo solo se admite una cuenta')
    }
    return await this.reportsService.reportBatery(reportWitOutDates, user);
  }

  @Auth()
  @Post('apci-week')
  async reportApCiWeek(
    @Body() reportWitOutDates: ReportDTO,
    @GetUser() user: User
  ) {
    if (reportWitOutDates.typeAccount > 1 && reportWitOutDates.accounts.length > 1) {
      throw new BadRequestException('Para consultas en grupo solo se admite una cuenta')
    }
    return await this.reportsService.reportApCiWeek(reportWitOutDates, user);
  }

  @Auth()
  @Post('state')
  async reportState(
    @Body() reportWitOutDates: ReportDTO,
    @GetUser() user: User
  ) {
    if (reportWitOutDates.typeAccount > 1 && reportWitOutDates.accounts.length > 1) {
      throw new BadRequestException('Para consultas en grupo solo se admite una cuenta')
    }
    return await this.reportsService.reportState(reportWitOutDates, user);
  }

  @Auth()
  @Post('ap-ci')
  async reportApCi(
    @Body() reportWithDates: ReportDatesDTO,
    @GetUser() user: User
  ) {
    return await this.reportsService.reportApCI(reportWithDates, user);
  }

  @Auth()
  @Post('event-alarm')
  async reportEventoAlarma(
    @Body() reportWithDates: ReportDatesDTO,
    @GetUser() user: User
  ) {
    return await this.reportsService.reportEventoAlarm(reportWithDates, user);
  }

}
