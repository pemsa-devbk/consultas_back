import { Module } from '@nestjs/common';
import { ClientProxyFactory, ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
    imports: [],
    providers: [
        {
            provide: 'DB_PACKAGE',
            useFactory: () => {
                return ClientProxyFactory.create({
                    transport: Transport.GRPC,
                    options: {
                        url: '0.0.0.0:7000',
                        package: 'db',
                        protoPath: join(__dirname, './protos/db.proto')
                    }
                })
            }
        }
    ],
    exports: ['DB_PACKAGE']
})
export class CommonModule { }
