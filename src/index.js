const _ = require('lodash');
const ResponseHttp = require('http-response-object');
const Ajv = require('ajv');
const AjvErrors = require('ajv-error-messages');

module.exports = {
    getValuesForSp: (_data, _values) => {
        return getValuesForSp(_data, _values);
    },
    validateRequest: (_data, _rules) => {
        return validateRequest(_data, _rules);
    },
    responseSuccess: (_data, _message, _status, _headers) => {
        return responseSuccess(_data, _message, _status, _headers);
    },
    responseError: (_data, _message, _status, _headers) => {
        return responseError(_data, _message, _status, _headers);
    },
};

const getValuesForSp = (_data, _values) => {

    let array = [];

    _.forEach(_values, (value) => {
        array.push(_data[value]);
    });

    return array;
};

const validateRequest = (_request, _schema) => {

    const validate = new Ajv({useDefaults: true}).compile(_schema);

    let request_body = convertStringToJson(_request.body);

    let request_param = convertStringToJson(_request.queryStringParameters);

    let request_path = convertStringToJson(_request.pathParameters);

    let request = {};

    request['data'] = _.merge(request_param, request_body);

    request['data'] = _.merge(request['data'], request_path);

    request['valid'] = validate(request['data']);

    request['errors'] = validate.errors;

    return request;
};

const convertStringToJson = (string) => {
    if (_.isNil(string))
        return {};

    return JSON.parse(string);
};

const convertJsonToString = (json) => {
    if (_.isNil(json))
        return "";

    return JSON.stringify(json);
};

const response = (_data, _message, _status, _headers) => {

    let headers = _.merge(_headers, {'Access-Control-Allow-Origin': '*'});

    let status = _status || 200;

    let data;

    if (_.isNull(_data)) {
        data = null;
    } else {
        data = {'data': _data};
    }

    if (!_.isNull(_message)) {
        data = _.merge(data, {message: _message});
    }

    return new ResponseHttp(status, headers, convertJsonToString(data));
};

const responseSuccess = (_data, _message, _status, _headers) => {
    return response(_data, _message, _status, _headers);
};

const responseError = (_data, _message, _status, _headers) => {

    if (_.isNil(_data))
        return response(null, _message, _status, _headers);

    let data = AjvErrors(_data);

    return response(data, _message, _status, _headers);
};
