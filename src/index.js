/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB();

async function readTemperature() {
    const params = {
        TableName: process.env.tablename,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": {S: 'sample'}
        },
        ScanIndexForward: false,
        Limit: 1
    };

    try {
        const data = await dynamoDb.query(params).promise();
        console.log(data);
        const temperatureData = data.Items.map(item => ({
          timestamp: item.timestamp.S,
          value: item.temperature.N
        }));

        console.log(temperatureData);

        return temperatureData[0].value;
    } catch (err) {
        console.log('Error reading temperature data: ', err);
        throw err;
    }
}

async function readAvgTemperature() {
    const params = {
        TableName: process.env.tablename,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": {S: 'sample'}
        },
        ScanIndexForward: false,
        Limit: 5
    };

    try {
        const data = await dynamoDb.query(params).promise();
        console.log(data);
        const temperatureData = data.Items.map(item => ({
          timestamp: item.timestamp.S,
          value: item.temperature.N
        }));

        var sum = 0;
        for (var i=0; i < 5; ++i) {
            sum += parseInt(temperatureData[i].value);
        }
        sum /= 5;

        return sum
    } catch (err) {
        console.log('Error reading avg temperature data: ', err);
        throw err;
    }
}

async function readHumidity() {
    const params = {
        TableName: process.env.tablename,
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": {S: 'sample'}
        },
        ScanIndexForward: false,
        Limit: 1
    };

    try {
        const data = await dynamoDb.query(params).promise();
        console.log(data);
        const humidityData = data.Items.map(item => ({
          timestamp: item.timestamp.S,
          value: item.humidity.N
        }));

        console.log(humidityData);

        return humidityData[0].value;
    } catch (err) {
        console.log('Error reading humidity data: ', err);
        throw err;
    }
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Buongiorno! Puoi dire temperatura o umidità per ottenere il valore. Cosa preferisci fare?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TemperatureIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TemperatureIntent';
    },
    async handle(handlerInput) {
        const t = await readTemperature();

        const speakOutput = `L'ultimo valore di temperatura è ${t} gradi.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AvgTemperatureIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AvgTemperatureIntent';
    },
    async handle(handlerInput) {
        const t = await readAvgTemperature();

        const speakOutput = `La media delle ultime 5 lettura è ${t} gradi.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HumidityIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HumidityIntent';
    },
    async handle(handlerInput) {
        const h = await readHumidity();

        const speakOutput = `L'ultimo valore di umidità è ${h} %.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Dimmi ciao e io ti risponderò! Come posso aiutarti?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'A presto!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Perdonami, penso di non aver capito bene. Riprova.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Hai invocato l'intento ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Scusa, c\'è stato un errore. Riprova.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        TemperatureIntentHandler,
        AvgTemperatureIntentHandler,
        HumidityIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .lambda();