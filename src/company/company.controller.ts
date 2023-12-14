import { Controller, Get, Post, Body, Param, Delete, UseInterceptors, UploadedFiles, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { User } from '../user/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // TODO rutas a establecer
  /**
   * 1. Crear empresa junto a usuario
   * 2. Editar datos de la empresa
   * 3. Acciones a las empresas
   * 4. 
   */


  @Auth(ValidRoles.superUser)
  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @GetUser() user: User
  ) {
    return this.companyService.create(createCompanyDto, user);
  }


  

  // @Get()
  // findAll() {
  //   return this.companyService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id', ParseUUIDPipe) id: string) {
  //   return this.companyService.testService(id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
  //   return this.companyService.update(+id, updateCompanyDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.companyService.remove(+id);
  // }

  // ? Para el manejo de certificados 

  @Auth(ValidRoles.superUser)
  @Post('upload-certs/:id')
  @UseInterceptors(AnyFilesInterceptor())
  uploadCerts(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param('id', ParseUUIDPipe) id: string
  ) {

    if (files.length !== 3) throw new BadRequestException('Cantidad de archivos invalidos');

    if (!files.every(file => ['ca.crt', 'client.key', 'client.crt'].includes(file.originalname))) throw new BadRequestException("Extención no valida");
    
    return this.companyService.uploadCerts(id, files);
  }

  @Auth(ValidRoles.superUser)
  @Get('create-connection/:id')
  createConnection(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.companyService.createConecction(id);
  }

  @Auth(ValidRoles.superUser)
  @Delete('delete-connection/:id')
  deleteConnection(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.companyService.deleteService(id);
  }

}
