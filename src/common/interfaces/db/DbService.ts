// Original file: proto/main.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Account as _accounts_Account, Account__Output as _accounts_Account__Output } from '../accounts/Account';
import type { AccountRequest as _accounts_AccountRequest, AccountRequest__Output as _accounts_AccountRequest__Output } from '../accounts/AccountRequest';
import type { AccountsEventResponse as _events_AccountsEventResponse, AccountsEventResponse__Output as _events_AccountsEventResponse__Output } from '../events/AccountsEventResponse';
import type { AccountsLastEventResponse as _events_AccountsLastEventResponse, AccountsLastEventResponse__Output as _events_AccountsLastEventResponse__Output } from '../events/AccountsLastEventResponse';
import type { AccountsRequest as _accounts_AccountsRequest, AccountsRequest__Output as _accounts_AccountsRequest__Output } from '../accounts/AccountsRequest';
import type { AccountsResponse as _accounts_AccountsResponse, AccountsResponse__Output as _accounts_AccountsResponse__Output } from '../accounts/AccountsResponse';
import type { EventWOAccountResponse as _events_EventWOAccountResponse, EventWOAccountResponse__Output as _events_EventWOAccountResponse__Output } from '../events/EventWOAccountResponse';
import type { EventsGrouprequest as _events_EventsGrouprequest, EventsGrouprequest__Output as _events_EventsGrouprequest__Output } from '../events/EventsGrouprequest';
import type { EventsRequest as _events_EventsRequest, EventsRequest__Output as _events_EventsRequest__Output } from '../events/EventsRequest';
import type { EventsWOAccountRequest as _events_EventsWOAccountRequest, EventsWOAccountRequest__Output as _events_EventsWOAccountRequest__Output } from '../events/EventsWOAccountRequest';
import type { Group as _groups_Group, Group__Output as _groups_Group__Output } from '../groups/Group';
import type { GroupRequestFilter as _groups_GroupRequestFilter, GroupRequestFilter__Output as _groups_GroupRequestFilter__Output } from '../groups/GroupRequestFilter';
import type { GroupsEventsResponse as _events_GroupsEventsResponse, GroupsEventsResponse__Output as _events_GroupsEventsResponse__Output } from '../events/GroupsEventsResponse';
import type { GroupsLastEventResponse as _events_GroupsLastEventResponse, GroupsLastEventResponse__Output as _events_GroupsLastEventResponse__Output } from '../events/GroupsLastEventResponse';
import type { LastEventGroupRequest as _events_LastEventGroupRequest, LastEventGroupRequest__Output as _events_LastEventGroupRequest__Output } from '../events/LastEventGroupRequest';
import type { LastEventRequest as _events_LastEventRequest, LastEventRequest__Output as _events_LastEventRequest__Output } from '../events/LastEventRequest';
import type { ResponseGroups as _groups_ResponseGroups, ResponseGroups__Output as _groups_ResponseGroups__Output } from '../groups/ResponseGroups';
import type { SearchRequestGroup as _groups_SearchRequestGroup, SearchRequestGroup__Output as _groups_SearchRequestGroup__Output } from '../groups/SearchRequestGroup';
import type { EmptyRequest as _db_EmptyRequest, EmptyRequest__Output as _db_EmptyRequest__Output } from '../db/EmptyRequest';
import type { ResponseTest as _db_ResponseTest, ResponseTest__Output as _db_ResponseTest__Output } from '../db/ResponseTest';


import { Observable } from 'rxjs';

export interface DbServiceClient extends grpc.Client {
  
  FindOneAccount(argument: _accounts_AccountRequest): Observable<_accounts_Account__Output>;  
  findOneAccount(argument: _accounts_AccountRequest): Observable<_accounts_Account__Output>;  

  
  FindOneGroup(argument: _groups_GroupRequestFilter): Observable<_groups_Group__Output>;
  findOneGroup(argument: _groups_GroupRequestFilter): Observable<_groups_Group__Output>;
  
  
  GetEventsFromGroup(argument: _events_EventsGrouprequest): Observable<_events_GroupsEventsResponse__Output>;
  getEventsFromGroup(argument: _events_EventsGrouprequest): Observable<_events_GroupsEventsResponse__Output>;
  
  
  GetEventsWithAccounts(argument: _events_EventsRequest,): Observable<_events_AccountsEventResponse__Output>;
  getEventsWithAccounts(argument: _events_EventsRequest,): Observable<_events_AccountsEventResponse__Output>;

  
  GetEventsWithOutAccounts(argument: _events_EventsWOAccountRequest): Observable<_events_EventWOAccountResponse__Output>;
  getEventsWithOutAccounts(argument: _events_EventsWOAccountRequest): Observable<_events_EventWOAccountResponse__Output>;
  
  

  GetLasEventFromAccount(argument: _events_LastEventRequest,): Observable<_events_AccountsLastEventResponse__Output>;
  getLasEventFromAccount(argument: _events_LastEventRequest,): Observable<_events_AccountsLastEventResponse__Output>;
  

  GetLastEventFromGroup(argument: _events_LastEventGroupRequest): Observable<_events_GroupsLastEventResponse__Output>;
  getLastEventFromGroup(argument: _events_LastEventGroupRequest): Observable<_events_GroupsLastEventResponse__Output>;
  
  

  SearchAccounts(argument: _accounts_AccountsRequest): Observable<_accounts_AccountsResponse__Output>;
  searchAccounts(argument: _accounts_AccountsRequest): Observable<_accounts_AccountsResponse__Output>;
  
  
  SearchGroups(argument: _groups_SearchRequestGroup): Observable<_groups_ResponseGroups__Output>;
  searchGroups(argument: _groups_SearchRequestGroup): Observable<_groups_ResponseGroups__Output>;

  Test(argument: _db_EmptyRequest): Observable<_db_ResponseTest__Output>;
  test(argument: _db_EmptyRequest): Observable<_db_ResponseTest__Output>;


  
}

export interface DbServiceHandlers extends grpc.UntypedServiceImplementation {
  FindOneAccount: grpc.handleUnaryCall<_accounts_AccountRequest__Output, _accounts_Account>;

  FindOneGroup: grpc.handleUnaryCall<_groups_GroupRequestFilter__Output, _groups_Group>;

  GetEventsFromGroup: grpc.handleUnaryCall<_events_EventsGrouprequest__Output, _events_GroupsEventsResponse>;

  GetEventsWithAccounts: grpc.handleUnaryCall<_events_EventsRequest__Output, _events_AccountsEventResponse>;

  GetEventsWithOutAccounts: grpc.handleUnaryCall<_events_EventsWOAccountRequest__Output, _events_EventWOAccountResponse>;

  GetLasEventFromAccount: grpc.handleUnaryCall<_events_LastEventRequest__Output, _events_AccountsLastEventResponse>;

  GetLastEventFromGroup: grpc.handleUnaryCall<_events_LastEventGroupRequest__Output, _events_GroupsLastEventResponse>;

  SearchAccounts: grpc.handleUnaryCall<_accounts_AccountsRequest__Output, _accounts_AccountsResponse>;

  SearchGroups: grpc.handleUnaryCall<_groups_SearchRequestGroup__Output, _groups_ResponseGroups>;

  Test: grpc.handleUnaryCall<_db_EmptyRequest__Output, _db_ResponseTest>;

}

export interface DbServiceDefinition extends grpc.ServiceDefinition {
  FindOneAccount: MethodDefinition<_accounts_AccountRequest, _accounts_Account, _accounts_AccountRequest__Output, _accounts_Account__Output>
  FindOneGroup: MethodDefinition<_groups_GroupRequestFilter, _groups_Group, _groups_GroupRequestFilter__Output, _groups_Group__Output>
  GetEventsFromGroup: MethodDefinition<_events_EventsGrouprequest, _events_GroupsEventsResponse, _events_EventsGrouprequest__Output, _events_GroupsEventsResponse__Output>
  GetEventsWithAccounts: MethodDefinition<_events_EventsRequest, _events_AccountsEventResponse, _events_EventsRequest__Output, _events_AccountsEventResponse__Output>
  GetEventsWithOutAccounts: MethodDefinition<_events_EventsWOAccountRequest, _events_EventWOAccountResponse, _events_EventsWOAccountRequest__Output, _events_EventWOAccountResponse__Output>
  GetLasEventFromAccount: MethodDefinition<_events_LastEventRequest, _events_AccountsLastEventResponse, _events_LastEventRequest__Output, _events_AccountsLastEventResponse__Output>
  GetLastEventFromGroup: MethodDefinition<_events_LastEventGroupRequest, _events_GroupsLastEventResponse, _events_LastEventGroupRequest__Output, _events_GroupsLastEventResponse__Output>
  SearchAccounts: MethodDefinition<_accounts_AccountsRequest, _accounts_AccountsResponse, _accounts_AccountsRequest__Output, _accounts_AccountsResponse__Output>
  SearchGroups: MethodDefinition<_groups_SearchRequestGroup, _groups_ResponseGroups, _groups_SearchRequestGroup__Output, _groups_ResponseGroups__Output>
  Test: MethodDefinition<_db_EmptyRequest, _db_ResponseTest, _db_EmptyRequest__Output, _db_ResponseTest__Output>
}
