import { credentials } from '@grpc/grpc-js';
import { Module } from '@nestjs/common';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { readFileSync } from 'fs';
import { join } from 'path';

@Module({
    imports: [],
    providers: [
        {
            provide: 'DB_PACKAGE',
            useFactory: () => {
                const credentialsToConnect = credentials.createSsl(
                    readFileSync(join(__dirname, '../certs/ca.crt')),
                    readFileSync(join(__dirname, '../certs/client.key')),
                    readFileSync(join(__dirname, '../certs/client.crt'))
                );
                return ClientProxyFactory.create({
                    transport: Transport.GRPC,
                    options: {
                        url: 'localhost:7001',
                        package: 'db',
                        protoPath: join(__dirname, './proto/main.proto'),
                        credentials: credentialsToConnect
                    }
                })
            }
        }
    ],
    exports: ['DB_PACKAGE']
})
export class CommonModule { }
