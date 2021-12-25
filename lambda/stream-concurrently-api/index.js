const { DynamoDB } = require('aws-sdk');

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.REGION });

exports.handler = async (event) => {

    switch (event.action) {
        case 'groups_exists':
            const res = await dynamo.get({
                TableName: process.env.TABLE_NAME,
                Key: { 'room-id': event.uuid }
            }).promise();
            return {
                statusCode: 200,
                body: JSON.stringify({ data: res }),
            };

        case 'allgroups':
            const res_2 = await dynamo.scan({ TableName: process.env.TABLE_NAME }).promise();
            return {
                statusCode: 200,
                body: JSON.stringify({ data: res_2 }),
            };

        default:
        // code
    }
};