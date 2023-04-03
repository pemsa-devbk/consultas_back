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
    FilterRequest: MessageTypeDefinition
    GeneralData: MessageTypeDefinition
    Panel: MessageTypeDefinition
    Partition: MessageTypeDefinition
    Security: MessageTypeDefinition
    StateAccount: EnumTypeDefinition
    User: MessageTypeDefinition
    Zone: MessageTypeDefinition
  }
  events: {
    AccountEventResponse: MessageTypeDefinition
    AccountTopEventResponse: MessageTypeDefinition
    AccountsEventResponse: MessageTypeDefinition
    AccountsTopEventResponse: MessageTypeDefinition
    CommentResponse: MessageTypeDefinition
    EventoResponse: MessageTypeDefinition
    EventoTopResponse: MessageTypeDefinition
    EventsGrouprequest: MessageTypeDefinition
    EventsRequest: MessageTypeDefinition
    EventsTopGroupRequest: MessageTypeDefinition
    EventsTopRequest: MessageTypeDefinition
    EventsWOAccountRequest: MessageTypeDefinition
    FilterEvents: MessageTypeDefinition
    GroupEventsResponse: MessageTypeDefinition
    GroupTopEventsResponse: MessageTypeDefinition
    GroupsEventsResponse: MessageTypeDefinition
    GroupsEventsTopResponse: MessageTypeDefinition
    Order: EnumTypeDefinition
    Scheduled: MessageTypeDefinition
    TypeCode: EnumTypeDefinition
  }
  groups: {
    Group: MessageTypeDefinition
    GroupRequest: MessageTypeDefinition
    GroupRequestFilter: MessageTypeDefinition
    GroupsRequestFilter: MessageTypeDefinition
    ResponseGroups: MessageTypeDefinition
    SearchRequestGroup: MessageTypeDefinition
    TypeGroup: EnumTypeDefinition
  }
}

