import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit, RequestTimeoutException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { DataSource, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { MailerService } from '../mailer/mailer.service';
import { ValidRoles } from '../auth/interfaces';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ServicesService } from '../services/services.service';

@Injectable()
export class CompanyService  implements OnModuleInit{

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly mailerService: MailerService,
    private readonly servicesService: ServicesService,
  ){}

  async create(createCompanyDto: CreateCompanyDto, user: User) {
    
    const { user: userToCreate, ...dataCompany} = createCompanyDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // * Crear compañia
      const company = this.companyRepository.create({
        ...dataCompany
      });
      // * Crear usuario y generar su contraseña
      const {password,user: userCreated} = this.userService.generateUser(userToCreate, user);
      await queryRunner.manager.save(userCreated);

      // * Asignar el usuario a la compañia y guardar 
      company.users = [userCreated]
      await queryRunner.manager.save(company);

      // * Enviar correo de bienvenida a la plataforma
      await this.mailerService.sendWelcome(userCreated.fullName, userCreated.email, password);

      await queryRunner.commitTransaction();

      return company;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.handleError(error);
    }finally{
      await queryRunner.release();
    }

  }
 
  async findAll() {
    const companies = await this.companyRepository.find({relations: {
      users: true
    }});
    return companies.map(company => {
      const {users, ...companyInformation} = company;
      return {
        ...companyInformation,
        users: users.filter(user => user.roles.includes(ValidRoles.admin))
      }
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    return `This action updates a #${id} company`;
  }

  remove(id: number) {
    return `This action removes a #${id} company`;
  }

  // ? Manejo de certificados 

  async uploadCerts(id: string, files: Array<Express.Multer.File>){
    const company = await this.companyRepository.findOneBy({id});

    if(!company)throw new NotFoundException(`La compañia con id ${id} no existe`);

    const path = join(__dirname, '..', 'certs', id);
    if(!existsSync(path)){
      mkdirSync(path)
    }
    files.forEach((file) => {
      const fileStream = createWriteStream(`${path}/${file.originalname}`);
      fileStream.write(file.buffer);
      fileStream.end();
    });

    return company;
  } // TODO Verificar respuesta

  async renewCerts(id: string){
    try {
      const company = await this.companyRepository.findOneBy({ id });

      if (!company) throw new NotFoundException(`La compañia con id ${id} no existe`);

      // await this.servicesService.createCerts(company.id, company.serviceUrl, this.decrypt(company.securityWord));

      return company;
    } catch (error) {
      this.handleError(error);
    }
  } // TODO Verificar respuesta 

  async createConecction(id: string){

    try {
      const company = await this.companyRepository.findOneBy({id});

      if(!company) throw new NotFoundException(`La empresa con id ${id} no existe`);

      await this.servicesService.addConnection(company.id, company.serviceUrl, company.portService);

      company.serviceIsActive = true;
      
      return await this.companyRepository.save(company);
    } catch (error) {
      console.log(error);
      
      this.handleError(error);
    }

  }// TODO verificar respuesta

  async testService(id: string){
    try {
      const company = await this.companyRepository.findOneBy({ id });
  
      if (!company) throw new NotFoundException(`La empresa con id ${id} no existe`);
  
  
      await this.servicesService.validateConnection(null, company.id)
      
      return true;
    } catch (error) {
      this.handleError(error);
    }
  }// TODO Verificar respuesta

  async deleteService(id: string){
    try {
      const company = await this.companyRepository.findOneBy({ id });

      if (!company) throw new NotFoundException(`La empresa con id ${id} no existe`);

      this.servicesService.deleteConnection(company.id);

      company.serviceIsActive = false;

      return await this.companyRepository.save(company);

    } catch (error) {
      this.handleError(error);
    }
  } // TODO Verificar respuesta

  


  private handleError(error: any): never {
    if (error.response) {
      const { message, statusCode } = error.response;
      throw new HttpException(message, statusCode)
    }
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if(error.code === 14){
      throw new RequestTimeoutException('No se pudo establecer conección con el servicio');
    }
    if(error.details){
      throw new InternalServerErrorException(`${error.details}`);
    }
    throw new InternalServerErrorException('Please check server logs');
  }

  

  async onModuleInit() { // * verificar los certificados
    const companies = await this.companyRepository.find();

    const companiesToConnect = companies.filter(company => company.serviceIsActive);
    
    const promisesToConnect = companiesToConnect.map( company => {
      return this.servicesService.addConnection(company.id, company.serviceUrl, company.portService)
    });

    await Promise.all(promisesToConnect);

  }
}
