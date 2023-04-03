// Original file: proto/db.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Account as _accounts_Account, Account__Output as _accounts_Account__Output } from '../accounts/Account';
import type { AccountRequest as _accounts_AccountRequest, AccountRequest__Output as _accounts_AccountRequest__Output } from '../accounts/AccountRequest';
import type { AccountsEventResponse as _events_AccountsEventResponse, AccountsEventResponse__Output as _events_AccountsEventResponse__Output } from '../events/AccountsEventResponse';
import type { AccountsRequest as _accounts_AccountsRequest, AccountsRequest__Output as _accounts_AccountsRequest__Output } from '../accounts/AccountsRequest';
import type { AccountsResponse as _accounts_AccountsResponse, AccountsResponse__Output as _accounts_AccountsResponse__Output } from '../accounts/AccountsResponse';
import type { AccountsTopEventResponse as _events_AccountsTopEventResponse, AccountsTopEventResponse__Output as _events_AccountsTopEventResponse__Output } from '../events/AccountsTopEventResponse';
import type { EventsGrouprequest as _events_EventsGrouprequest, EventsGrouprequest__Output as _events_EventsGrouprequest__Output } from '../events/EventsGrouprequest';
import type { EventsRequest as _events_EventsRequest, EventsRequest__Output as _events_EventsRequest__Output } from '../events/EventsRequest';
import type { EventsTopGroupRequest as _events_EventsTopGroupRequest, EventsTopGroupRequest__Output as _events_EventsTopGroupRequest__Output } from '../events/EventsTopGroupRequest';
import type { EventsTopRequest as _events_EventsTopRequest, EventsTopRequest__Output as _events_EventsTopRequest__Output } from '../events/EventsTopRequest';
import type { EventsWOAccountRequest as _events_EventsWOAccountRequest, EventsWOAccountRequest__Output as _events_EventsWOAccountRequest__Output } from '../events/EventsWOAccountRequest';
import type { FilterRequest as _accounts_FilterRequest, FilterRequest__Output as _accounts_FilterRequest__Output } from '../accounts/FilterRequest';
import type { Group as _groups_Group, Group__Output as _groups_Group__Output } from '../groups/Group';
import type { GroupRequestFilter as _groups_GroupRequestFilter, GroupRequestFilter__Output as _groups_GroupRequestFilter__Output } from '../groups/GroupRequestFilter';
import type { GroupsEventsResponse as _events_GroupsEventsResponse, GroupsEventsResponse__Output as _events_GroupsEventsResponse__Output } from '../events/GroupsEventsResponse';
import type { GroupsEventsTopResponse as _events_GroupsEventsTopResponse, GroupsEventsTopResponse__Output as _events_GroupsEventsTopResponse__Output } from '../events/GroupsEventsTopResponse';
import type { GroupsRequestFilter as _groups_GroupsRequestFilter, GroupsRequestFilter__Output as _groups_GroupsRequestFilter__Output } from '../groups/GroupsRequestFilter';
import type { ResponseGroups as _groups_ResponseGroups, ResponseGroups__Output as _groups_ResponseGroups__Output } from '../groups/ResponseGroups';
import type { SearchRequestGroup as _groups_SearchRequestGroup, SearchRequestGroup__Output as _groups_SearchRequestGroup__Output } from '../groups/SearchRequestGroup';
import { Observable } from 'rxjs';

export interface DbServiceClient {
  AllAccounts(argument: _accounts_FilterRequest): Observable<_accounts_AccountsResponse__Output>;
  allAccounts(argument: _accounts_FilterRequest): Observable<_accounts_AccountsResponse__Output>;
  
  AllGroups(argument: _groups_GroupsRequestFilter): Observable<_groups_ResponseGroups__Output>;
  allGroups(argument: _groups_GroupsRequestFilter): Observable<_groups_ResponseGroups__Output>;
  
  FindOneAccount(argument: _accounts_AccountRequest): Observable<_accounts_Account__Output>;
  findOneAccount(argument: _accounts_AccountRequest): Observable<_accounts_Account__Output>;
  
  FindOneGroup(argument: _groups_GroupRequestFilter): Observable<_groups_Group__Output>;
  findOneGroup(argument: _groups_GroupRequestFilter): Observable<_groups_Group__Output>;
  
  GetEvents(argument: _events_EventsRequest): Observable<_events_AccountsEventResponse__Output>;
  getEvents(argument: _events_EventsRequest): Observable<_events_AccountsEventResponse__Output>;
 
  GetEventsFromGroup(argument: _events_EventsGrouprequest): Observable<_events_GroupsEventsResponse__Output>;
  getEventsFromGroup(argument: _events_EventsGrouprequest): Observable<_events_GroupsEventsResponse__Output>;
  
  GetEventsWithOutAccounts(argument: _events_EventsWOAccountRequest): Observable<_events_AccountsEventResponse__Output>;
  getEventsWithOutAccounts(argument: _events_EventsWOAccountRequest): Observable<_events_AccountsEventResponse__Output>;
  
  GetTopEvents(argument: _events_EventsTopRequest): Observable<_events_AccountsTopEventResponse__Output>;
  getTopEvents(argument: _events_EventsTopRequest): Observable<_events_AccountsTopEventResponse__Output>;
  
  GetTopEventsFromGroup(argument: _events_EventsTopGroupRequest): Observable<_events_GroupsEventsTopResponse__Output>;
  getTopEventsFromGroup(argument: _events_EventsTopGroupRequest): Observable<_events_GroupsEventsTopResponse__Output>;
  
  SearchAccounts(argument: _accounts_AccountsRequest ): Observable<_accounts_AccountsResponse__Output>;
  searchAccounts(argument: _accounts_AccountsRequest ): Observable<_accounts_AccountsResponse__Output>;
  
  SearchGroups(argument: _groups_SearchRequestGroup ): Observable<_groups_ResponseGroups__Output>;
  searchGroups(argument: _groups_SearchRequestGroup ): Observable<_groups_ResponseGroups__Output>;
  
}

export interface DbServiceHandlers extends grpc.UntypedServiceImplementation {
  AllAccounts: grpc.handleUnaryCall<_accounts_FilterRequest__Output, _accounts_AccountsResponse>;
  
  AllGroups: grpc.handleUnaryCall<_groups_GroupsRequestFilter__Output, _groups_ResponseGroups>;
  
  FindOneAccount: grpc.handleUnaryCall<_accounts_AccountRequest__Output, _accounts_Account>;
  
  FindOneGroup: grpc.handleUnaryCall<_groups_GroupRequestFilter__Output, _groups_Group>;
  
  GetEvents: grpc.handleUnaryCall<_events_EventsRequest__Output, _events_AccountsEventResponse>;
  
  GetEventsFromGroup: grpc.handleUnaryCall<_events_EventsGrouprequest__Output, _events_GroupsEventsResponse>;
  
  GetEventsWithOutAccounts: grpc.handleUnaryCall<_events_EventsWOAccountRequest__Output, _events_AccountsEventResponse>;
  
  GetTopEvents: grpc.handleUnaryCall<_events_EventsTopRequest__Output, _events_AccountsTopEventResponse>;
  
  GetTopEventsFromGroup: grpc.handleUnaryCall<_events_EventsTopGroupRequest__Output, _events_GroupsEventsTopResponse>;
  
  SearchAccounts: grpc.handleUnaryCall<_accounts_AccountsRequest__Output, _accounts_AccountsResponse>;
  
  SearchGroups: grpc.handleUnaryCall<_groups_SearchRequestGroup__Output, _groups_ResponseGroups>;
  
}

export interface DbServiceDefinition extends grpc.ServiceDefinition {
  AllAccounts: MethodDefinition<_accounts_FilterRequest, _accounts_AccountsResponse, _accounts_FilterRequest__Output, _accounts_AccountsResponse__Output>
  AllGroups: MethodDefinition<_groups_GroupsRequestFilter, _groups_ResponseGroups, _groups_GroupsRequestFilter__Output, _groups_ResponseGroups__Output>
  FindOneAccount: MethodDefinition<_accounts_AccountRequest, _accounts_Account, _accounts_AccountRequest__Output, _accounts_Account__Output>
  FindOneGroup: MethodDefinition<_groups_GroupRequestFilter, _groups_Group, _groups_GroupRequestFilter__Output, _groups_Group__Output>
  GetEvents: MethodDefinition<_events_EventsRequest, _events_AccountsEventResponse, _events_EventsRequest__Output, _events_AccountsEventResponse__Output>
  GetEventsFromGroup: MethodDefinition<_events_EventsGrouprequest, _events_GroupsEventsResponse, _events_EventsGrouprequest__Output, _events_GroupsEventsResponse__Output>
  GetEventsWithOutAccounts: MethodDefinition<_events_EventsWOAccountRequest, _events_AccountsEventResponse, _events_EventsWOAccountRequest__Output, _events_AccountsEventResponse__Output>
  GetTopEvents: MethodDefinition<_events_EventsTopRequest, _events_AccountsTopEventResponse, _events_EventsTopRequest__Output, _events_AccountsTopEventResponse__Output>
  GetTopEventsFromGroup: MethodDefinition<_events_EventsTopGroupRequest, _events_GroupsEventsTopResponse, _events_EventsTopGroupRequest__Output, _events_GroupsEventsTopResponse__Output>
  SearchAccounts: MethodDefinition<_accounts_AccountsRequest, _accounts_AccountsResponse, _accounts_AccountsRequest__Output, _accounts_AccountsResponse__Output>
  SearchGroups: MethodDefinition<_groups_SearchRequestGroup, _groups_ResponseGroups, _groups_SearchRequestGroup__Output, _groups_ResponseGroups__Output>
}
