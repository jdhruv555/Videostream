const { DynamoDB } = require('aws-sdk');

const dynamo = new DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: 'ap-south-1' });

// dynamo.put({
//     TableName: 'stream-concurrently',
//     Item: {
//         'room-id': 'group-1',
//         users: ['user-1'],
//         link: 'https://asdas.com'
//     }
// }, (err, data) => {
//     console.log({ err, data })
// })


// ADD USER IN MIDDLE
// dynamo.get({
//     TableName: 'stream-concurrently',
//     Key: {
//         'room-id': 'group-1'
//     }
// }, (err, data) => {
//     dynamo.update({
//         TableName: 'stream-concurrently',
//         Key: {
//             'room-id': 'group-1'
//         },
//         UpdateExpression: "set #users=:x",
//         ExpressionAttributeNames: {
//             "#users": "users"
//         },
//         ExpressionAttributeValues: {
//             ":x": [...data.Item.users, "user-4"]
//         },
//         ReturnValues: "UPDATED_NEW"
//     }, (err, data) => {
//         console.log(data.Attributes.users)
//     })
// })


// const a = dynamo.scan({
//     TableName: 'stream-concurrently',
// }, (err, data) => {
//     if (err) console.log({ err });

//     console.clear();
//     console.log(data.Items);
// })

var params = {
    TableName: 'stream-concurrently',
    FilterExpression: `contains(#users, :id)`,
    ExpressionAttributeNames: {
        "#users": "users"
    },
    ExpressionAttributeValues: {
        ":id": "Kw-KNcK6hcwCHvA="
    }
};


dynamo.scan(params, (err, data) => {
    if (err) console.error({ err });

    // const users = data.Items[0].users;
    // const removing_element = "KwV-yfctBcwCHIw=";

    // if (users.find(ele => ele === removing_element)) users.splice(users.indexOf(removing_element), 1)

    // dynamo.update({
    //     TableName: 'stream-concurrently',
    //     Key: {
    //         'room-id': data.Items[0]['room-id']
    //     },
    //     UpdateExpression: "set #users=:x",
    //     ExpressionAttributeNames: {
    //         "#users": "users"
    //     },
    //     ExpressionAttributeValues: {
    //         ":x": [...users]
    //     },
    //     ReturnValues: "UPDATED_NEW"
    // }, (err, data) => {
    //     console.clear();
    //     console.log(data.Attributes.users)
    // });

    console.clear()
    console.log(data.Items);
});

// dynamo.get({
//     TableName: 'stream-concurrently',
//     Key: {
//         'room-id': 'group-1'
//     }
// }, (err, data) => {
//     console.log(data)
// })