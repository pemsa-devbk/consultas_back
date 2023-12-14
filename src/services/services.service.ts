import { Injectable, BadRequestException } from '@nestjs/common';
import { ClientGrpc, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DbServiceClient } from '../common/interfaces/db/DbService';
import { firstValueFrom } from 'rxjs';
import { readFileSync } from 'fs';
import { credentials } from '@grpc/grpc-js';


@Injectable()
export class ServicesService {


  private readonly connections: Map<string, ClientGrpc> = new Map();

  // TODO LIST
  // * Agregar conexión al pool ✔
  // * Test de conexión ✔
  // * Obtener el servicio ✔
  // * Quitar conexión ✔

  async addConnection(id: string, domain: string, port: number) {
  
    if (this.connections.has(id)) {
      throw new BadRequestException("Ya hay una conexón establecida para esa empresa");
    }
    
    const client: ClientGrpc = this.createClient(id, domain, port);

    await this.validateConnection(client);
    
    
    this.connections.set(id, client);
    
    return client;

  }
  


  async validateConnection(client?: ClientGrpc, id?: string) {
    if(client){
      const service = client.getService<DbServiceClient>('DbService');
      return this.withTimeOut(firstValueFrom(service.test({ account: 5 })), 8000);
    }
    if (this.connections.has(id)) {
      const client = this.connections.get(id);
      const service = client.getService<DbServiceClient>('DbService');
      return this.withTimeOut(firstValueFrom(service.test({ account: 5  })), 8000);
    }
    throw new Error(`No existe una conexión con id: ${id}`);
  }

  private withTimeOut<T>(promise: Promise<T>, timeout: number): Promise<T>{
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject('El TEST ha excedido el tiempo de espera.'), timeout);
      }),
    ]);
  }

  getService(id: string): DbServiceClient {
    if (this.connections.has(id)) {
      const client = this.connections.get(id);
      const service = client.getService<DbServiceClient>('DbService');
      return service;
    }
    throw new Error(`No existe una conexión con el ID: ${id}`);
  }

  createClient(id: string, domain: string, port: number) {
    const credentialsToConnect = credentials.createSsl(
      readFileSync(join(__dirname, '..', 'certs', id, 'ca.crt')),
      readFileSync(join(__dirname, '..', 'certs', id, 'client.key')),
      readFileSync(join(__dirname, '..', 'certs', id, 'client.crt'))
    );
    
    
    const client: ClientGrpc = ClientProxyFactory.create({
      transport: Transport.GRPC,
      options: {
        url: `${domain}:${port}`,
        package: 'db',

        protoPath: join(__dirname, '../common/proto/main.proto'),
        credentials: credentialsToConnect
      }
    });
    return client;
  }

  deleteConnection(id: string){
    if (this.connections.has(id)) {
      return this.connections.delete(id);
    }
    throw new BadRequestException(`No existe una conexión con el ID: ${id}`);
  }

  
}
