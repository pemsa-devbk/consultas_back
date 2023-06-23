import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';


type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  accounts: {
    Account: MessageTypeDefinition
    AccountRequest: MessageTypeDefinition
    AccountsRequest: MessageTypeDefinition
    AccountsResponse: MessageTypeDefinition
    Contact: MessageTypeDefinition
    GeneralData: MessageTypeDefinition
    Panel: MessageTypeDefinition
    Partition: MessageTypeDefinition
    Schedule: MessageTypeDefinition
    Security: MessageTypeDefinition
    StateAccount: EnumTypeDefinition
    User: MessageTypeDefinition
    Zone: MessageTypeDefinition
  }
}

