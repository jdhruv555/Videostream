var DynamoDB = require('aws-sdk').DynamoDB;
var dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'ap-south-1' });
var params = {
    TableName: 'stream-concurrently',
    FilterExpression: "contains(#users, :id)",
    ExpressionAttributeNames: {
        "#users": "users"
    },
    ExpressionAttributeValues: {
        ":id": "Kw-KNcK6hcwCHvA="
    }
};
dynamo.scan(params, function (err, data) {
    if (err)
        console.error({ err: err });
    console.clear();
    console.log(data.Items);
});
