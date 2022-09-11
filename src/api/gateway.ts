
import * as Axios from "axios"
import { HttpClientConfig } from 'bungie-api-ts/destiny2';


export class ApiGateway {

    static MAX_REQUESTS_COUNT = 20;
    static INTERVAL_MS = 100;
    static PENDING_REQUESTS = 0;

    static api = Axios.default.create({});

    public static init() {
        /**
         * Axios Request Interceptor
         */
        ApiGateway.api.interceptors.request.use(function (config) {
            return new Promise((resolve, reject) => {
                let interval = setInterval(() => {
                    if (ApiGateway.PENDING_REQUESTS < ApiGateway.MAX_REQUESTS_COUNT) {
                        ApiGateway.PENDING_REQUESTS++
                        clearInterval(interval)
                        resolve(config)
                    }
                }, ApiGateway.INTERVAL_MS)
            })
        })
        /**
         * Axios Response Interceptor
         */
        ApiGateway.api.interceptors.response.use(function (response) {
            ApiGateway.PENDING_REQUESTS = Math.max(0, ApiGateway.PENDING_REQUESTS - 1)
            return Promise.resolve(response)
        }, function (error) {
            ApiGateway.PENDING_REQUESTS = Math.max(0, ApiGateway.PENDING_REQUESTS - 1)
            return Promise.reject(error)
        })
    }


    public static async $http(config: HttpClientConfig) {
        let options: Axios.AxiosRequestConfig = <Axios.AxiosRequestConfig>{};
        //		options.data = JSON.stringify(data);

        options.headers = {
            'X-API-Key': 'c5a34837e0c94691a98539bb64629e22',
            'Content-Type': 'application/json'
        };

        var result = undefined;

        if (config.params) {
            const queryString = Object.keys(config.params)
                .filter(key => config.params[key] != undefined)
                .map(key => key + '=' + config.params[key]).join('&');
            
            try {
                result = await ApiGateway.api.get(`${config.url}?${queryString}`, options);
            } catch (error) {
                if (error.response) {
                    if (error.response.data)
                    {
                        result = error.response.data;
                    }
                    else
                    {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log('Failed to get what I want, got status: ' + error.response.status);
                    }
                } else {
                    console.log('error bla bla');
                }    
                return null;  
            }
        }
        else {
            try {
                result = await ApiGateway.api.get(config.url, options);
            } catch (error) {
                if (error.response) {
                    if (error.response.data)
                    {
                        result = error.response.data;
                    }
                    else
                    {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log('Failed to get what I want, got status: ' + error.response.status);
                    }
                } else {
                    console.log('error bla bla');
                }    
                return null;  
            }
        }

        return result.data;
    }

    // private static MakeRequestGeneric<T>(data: Object, url: string, method: 'get' | 'put' | 'post' | 'delete'): Axios.AxiosPromise<T>
    // {
    // 	let options: Axios.AxiosRequestConfig = <Axios.AxiosRequestConfig>{};
    // 	options.data = JSON.stringify(data);

    // 	options.headers = {
    // 		'Content-Type': 'application/json',
    // 		'Data-Type': 'json'
    // 	};

    // 	options.method = method;
    // 	options.url = url;

    // 	let request: Axios.AxiosPromise<T> = Axios.default.request(options);
    // 	return request;
    // }
}

ApiGateway.init();