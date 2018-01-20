import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {

  const data = JSON.parse(event.body);

  const params = {
    TableName: "coins",
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      coinId: uuid.v1(),
      currency: data.currency,
      createdAt: new Date().getTime()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Items));
  } catch (e) {
    console.log(e);
    callback(null, failure({ status: false }));
  }
}
