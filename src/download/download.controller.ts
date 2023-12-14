import { Controller, Post, Body, Param, StreamableFile, VERSION_NEUTRAL } from '@nestjs/common';
import { DownloadService } from './download.service';
import { ReportDTO, FileType, ReportDatesDTO } from '../common/dto';
import { FormatFileDto } from './dto/file-type.dto';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller({
  version: '1',
  path: 'download'
})
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Auth()
  @Post('batery/:format')
  async batery(
    @Body() reportDTO: ReportDTO,
    @Param() params: FormatFileDto,
    @GetUser() user: User
  ) {
    if( params.format === FileType.PDF){
      const file = new Uint8Array(await this.downloadService.bateryPDF(reportDTO, user))
      return new StreamableFile(file);
    }
    const file = new Uint8Array(await this.downloadService.bateryXLSX(reportDTO, user))
    return new StreamableFile(file);
  }

  @Auth()
  @Post('state/:format')
  async state(
    @Body() reportDTO: ReportDTO,
    @Param() params: FormatFileDto,
    @GetUser() user: User
  ){
    if (params.format === FileType.PDF) {
      const file = new Uint8Array(await this.downloadService.statePDF(reportDTO, user))
      return new StreamableFile(file);
    }
    const file = new Uint8Array(await this.downloadService.stateXLSX(reportDTO, user))
    return new StreamableFile(file);
  }

  @Auth()
  @Post('ap-ci-week/:format')
  async apciWeek(
    @Body() reportDTO: ReportDTO,
    @Param() params: FormatFileDto,
    @GetUser() user: User
  ) {
    if (params.format === FileType.PDF) {
      const file = new Uint8Array(await this.downloadService.apciWeekPDF(reportDTO, user))
      return new StreamableFile(file);
    }
    const file = new Uint8Array(await this.downloadService.apciWeekXLSX(reportDTO, user))
    return new StreamableFile(file);
  }

  @Auth()
  @Post('ap-ci/:format')
  async apci(
    @Body() reportDTO: ReportDatesDTO,
    @Param() params: FormatFileDto,
    @GetUser() user: User
  ) {
    if (params.format === FileType.PDF) {
      const file = new Uint8Array(await this.downloadService.apiciPDF(reportDTO, user))
      return new StreamableFile(file);
    }
    const file = new Uint8Array(await this.downloadService.apciXLSX(reportDTO, user))
    return new StreamableFile(file);
  }

  @Auth()
  @Post('alarm/:format')
  async alarm(
    @Body() reportDTO: ReportDatesDTO,
    @Param() params: FormatFileDto,
    @GetUser() user: User
  ) {
    if (params.format === FileType.PDF) {
      const file = new Uint8Array(await this.downloadService.alarmPDF(reportDTO, user))
      return new StreamableFile(file);
    }
    const file = new Uint8Array(await this.downloadService.alarmXLSX(reportDTO, user))
    return new StreamableFile(file);
  }

  
}
