export * from './authorizationV202309Api';
import { AuthorizationV202309Api, AuthorizationV202309ApiOperationNames, AuthorizationV202309ApiOperationTypes } from './authorizationV202309Api';
export * from './authorizationV202312Api';
import { AuthorizationV202312Api, AuthorizationV202312ApiOperationNames, AuthorizationV202312ApiOperationTypes } from './authorizationV202312Api';
export * from './authorizationV202401Api';
import { AuthorizationV202401Api, AuthorizationV202401ApiOperationNames, AuthorizationV202401ApiOperationTypes } from './authorizationV202401Api';
export * from './authorizationV202403Api';
import { AuthorizationV202403Api, AuthorizationV202403ApiOperationNames, AuthorizationV202403ApiOperationTypes } from './authorizationV202403Api';

import * as http from 'http';

export class HttpError extends Error {
    constructor (public response: http.IncomingMessage, public body: any, public statusCode?: number) {
        super('HTTP request failed');
        this.name = 'HttpError';
    }
}

export type { RequestFile } from '../model/models';

export const APIS = [
    AuthorizationV202309Api,
    AuthorizationV202312Api,
    AuthorizationV202401Api,
    AuthorizationV202403Api,
];

export enum API_ENUM {
    AuthorizationV202309Api = 'AuthorizationV202309Api',
    AuthorizationV202312Api = 'AuthorizationV202312Api',
    AuthorizationV202401Api = 'AuthorizationV202401Api',
    AuthorizationV202403Api = 'AuthorizationV202403Api',
}

export const API_OBJECT = {
    AuthorizationV202309Api: AuthorizationV202309Api,
    AuthorizationV202312Api: AuthorizationV202312Api,
    AuthorizationV202401Api: AuthorizationV202401Api,
    AuthorizationV202403Api: AuthorizationV202403Api,
};

export type API_OPERATION_TYPE_MAP = {
    [API_ENUM.AuthorizationV202309Api]: AuthorizationV202309Api;
    [API_ENUM.AuthorizationV202312Api]: AuthorizationV202312Api;
    [API_ENUM.AuthorizationV202401Api]: AuthorizationV202401Api;
    [API_ENUM.AuthorizationV202403Api]: AuthorizationV202403Api;
};

export type API_OPERATION_TYPES = AuthorizationV202309ApiOperationTypes;
