import type * as grpc from '@grpc/grpc-js';
import type { EnumTypeDefinition, MessageTypeDefinition } from '@grpc/proto-loader';

import type { DbServiceClient as _db_DbServiceClient, DbServiceDefinition as _db_DbServiceDefinition } from './db/DbService';


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
  db: {
    DbService: SubtypeConstructor<typeof grpc.Client, _db_DbServiceClient> & { service: _db_DbServiceDefinition }
    EmptyRequest: MessageTypeDefinition
    ResponseTest: MessageTypeDefinition
  }
  events: {
    AccountEventResponse: MessageTypeDefinition
    AccountLastEventResponse: MessageTypeDefinition
    AccountsEventResponse: MessageTypeDefinition
    AccountsLastEventResponse: MessageTypeDefinition
    CommentResponse: MessageTypeDefinition
    EventResponse: MessageTypeDefinition
    EventWOAccountResponse: MessageTypeDefinition
    EventoResponse: MessageTypeDefinition
    EventsGrouprequest: MessageTypeDefinition
    EventsRequest: MessageTypeDefinition
    EventsWOAccountRequest: MessageTypeDefinition
    FilterEvents: MessageTypeDefinition
    GroupEventsResponse: MessageTypeDefinition
    GroupLastEventResponse: MessageTypeDefinition
    GroupsEventsResponse: MessageTypeDefinition
    GroupsLastEventResponse: MessageTypeDefinition
    LastEventGroupRequest: MessageTypeDefinition
    LastEventRequest: MessageTypeDefinition
    LastEventoResponse: MessageTypeDefinition
    Order: EnumTypeDefinition
    TypeCode: EnumTypeDefinition
  }
  groups: {
    Group: MessageTypeDefinition
    GroupRequest: MessageTypeDefinition
    GroupRequestFilter: MessageTypeDefinition
    ResponseGroups: MessageTypeDefinition
    SearchRequestGroup: MessageTypeDefinition
    TypeGroup: EnumTypeDefinition
  }
}

