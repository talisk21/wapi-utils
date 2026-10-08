import localVarRequest from 'request';

export * from './authorization/V202309/GetAuthorizedShopsResponse';
export * from './authorization/V202309/GetAuthorizedShopsResponseData';
export * from './authorization/V202309/GetAuthorizedShopsResponseDataShops';
export * from './authorization/V202312/GetWidgetTokenResponse';
export * from './authorization/V202312/GetWidgetTokenResponseData';
export * from './authorization/V202312/GetWidgetTokenResponseDataWidgetToken';
export * from './authorization/V202401/GetWidgetTokenResponse';
export * from './authorization/V202401/GetWidgetTokenResponseData';
export * from './authorization/V202401/GetWidgetTokenResponseDataWidgetToken';
export * from './authorization/V202403/DeauthorizeShopResponse';

import { Authorization202309GetAuthorizedShopsResponse } from './authorization/V202309/GetAuthorizedShopsResponse';
import { Authorization202309GetAuthorizedShopsResponseData } from './authorization/V202309/GetAuthorizedShopsResponseData';
import { Authorization202309GetAuthorizedShopsResponseDataShops } from './authorization/V202309/GetAuthorizedShopsResponseDataShops';
import { Authorization202312GetWidgetTokenResponse } from './authorization/V202312/GetWidgetTokenResponse';
import { Authorization202312GetWidgetTokenResponseData } from './authorization/V202312/GetWidgetTokenResponseData';
import { Authorization202312GetWidgetTokenResponseDataWidgetToken } from './authorization/V202312/GetWidgetTokenResponseDataWidgetToken';
import { Authorization202401GetWidgetTokenResponse } from './authorization/V202401/GetWidgetTokenResponse';
import { Authorization202401GetWidgetTokenResponseData } from './authorization/V202401/GetWidgetTokenResponseData';
import { Authorization202401GetWidgetTokenResponseDataWidgetToken } from './authorization/V202401/GetWidgetTokenResponseDataWidgetToken';
import { Authorization202403DeauthorizeShopResponse } from './authorization/V202403/DeauthorizeShopResponse';

export type RequestFile = string | Buffer | fs.ReadStream;
import * as fs from 'fs';

let primitives = [
    "string",
    "boolean",
    "double",
    "integer",
    "long",
    "float",
    "number",
    "any"
];

let typeMap: {[index: string]: any} = {
    "Authorization202309GetAuthorizedShopsResponse": Authorization202309GetAuthorizedShopsResponse,
    "Authorization202309GetAuthorizedShopsResponseData": Authorization202309GetAuthorizedShopsResponseData,
    "Authorization202309GetAuthorizedShopsResponseDataShops": Authorization202309GetAuthorizedShopsResponseDataShops,
    "Authorization202312GetWidgetTokenResponse": Authorization202312GetWidgetTokenResponse,
    "Authorization202312GetWidgetTokenResponseData": Authorization202312GetWidgetTokenResponseData,
    "Authorization202312GetWidgetTokenResponseDataWidgetToken": Authorization202312GetWidgetTokenResponseDataWidgetToken,
    "Authorization202401GetWidgetTokenResponse": Authorization202401GetWidgetTokenResponse,
    "Authorization202401GetWidgetTokenResponseData": Authorization202401GetWidgetTokenResponseData,
    "Authorization202401GetWidgetTokenResponseDataWidgetToken": Authorization202401GetWidgetTokenResponseDataWidgetToken,
    "Authorization202403DeauthorizeShopResponse": Authorization202403DeauthorizeShopResponse,
}

export class ObjectSerializer {
    public static findCorrectType(data: any, expectedType: string) {
        if (data == undefined) {
            return expectedType;
        } else if (primitives.indexOf(expectedType.toLowerCase()) !== -1) {
            return expectedType;
        } else if (expectedType === "Date") {
            return expectedType;
        } else {
            if (enumsMap[expectedType]) {
                return expectedType;
            }

            if (!typeMap[expectedType]) {
                return expectedType;
            }

            let discriminatorProperty = typeMap[expectedType].discriminator;
            if (discriminatorProperty == null) {
                return expectedType;
            } else {
                if (data[discriminatorProperty]) {
                    var discriminatorType = data[discriminatorProperty];
                    if(typeMap[discriminatorType]){
                        return discriminatorType;
                    } else {
                        return expectedType;
                    }
                } else {
                    return expectedType;
                }
            }
        }
    }

    public static serialize(data: any, type: string) {
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) {
            let subType: string = type.replace("Array<", "");
            subType = subType.substring(0, subType.length - 1);
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.serialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return data.toISOString();
        } else {
            if (enumsMap[type]) {
                return data;
            }
            if (!typeMap[type]) {
                return data;
            }

            type = this.findCorrectType(data, type);
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            let instance: {[index: string]: any} = {};
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.baseName] = ObjectSerializer.serialize(data[attributeType.name], attributeType.type);
            }
            return instance;
        }
    }

    public static deserialize(data: any, type: string) {
        type = ObjectSerializer.findCorrectType(data, type);
        if (data == undefined) {
            return data;
        } else if (primitives.indexOf(type.toLowerCase()) !== -1) {
            return data;
        } else if (type.lastIndexOf("Array<", 0) === 0) {
            let subType: string = type.replace("Array<", "");
            subType = subType.substring(0, subType.length - 1);
            let transformedData: any[] = [];
            for (let index = 0; index < data.length; index++) {
                let datum = data[index];
                transformedData.push(ObjectSerializer.deserialize(datum, subType));
            }
            return transformedData;
        } else if (type === "Date") {
            return new Date(data);
        } else {
            if (enumsMap[type]) {
                return data;
            }

            if (!typeMap[type]) {
                return data;
            }

            let instance = new typeMap[type]();
            let attributeTypes = typeMap[type].getAttributeTypeMap();
            for (let index = 0; index < attributeTypes.length; index++) {
                let attributeType = attributeTypes[index];
                instance[attributeType.name] = ObjectSerializer.deserialize(data[attributeType.baseName], attributeType.type);
            }
            return instance;
        }
    }
}

let enumsMap: {[index: string]: any} = {};

export interface Authentication {
    applyToRequest(requestOptions: localVarRequest.Options): Promise<void> | void;
}

export class HttpBasicAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        requestOptions.auth = {
            username: this.username, password: this.password
        }
    }
}

export class HttpBearerAuth implements Authentication {
    public accessToken: string | (() => string) = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            const accessToken = typeof this.accessToken === 'function'
                            ? this.accessToken()
                            : this.accessToken;
            requestOptions.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
}

export class ApiKeyAuth implements Authentication {
    public apiKey: string = '';

    constructor(private location: string, private paramName: string) {
    }

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (this.location == "query") {
            (<any>requestOptions.qs)[this.paramName] = this.apiKey;
        } else if (this.location == "header" && requestOptions && requestOptions.headers) {
            requestOptions.headers[this.paramName] = this.apiKey;
        } else if (this.location == 'cookie' && requestOptions && requestOptions.headers) {
            if (requestOptions.headers['Cookie']) {
                requestOptions.headers['Cookie'] += '; ' + this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
            else {
                requestOptions.headers['Cookie'] = this.paramName + '=' + encodeURIComponent(this.apiKey);
            }
        }
    }
}

export class OAuth implements Authentication {
    public accessToken: string = '';

    applyToRequest(requestOptions: localVarRequest.Options): void {
        if (requestOptions && requestOptions.headers) {
            requestOptions.headers["Authorization"] = "Bearer " + this.accessToken;
        }
    }
}

export class VoidAuth implements Authentication {
    public username: string = '';
    public password: string = '';

    applyToRequest(_: localVarRequest.Options): void {
        // Do nothing
    }
}

export type Interceptor = (requestOptions: localVarRequest.Options) => (Promise<void> | void);
