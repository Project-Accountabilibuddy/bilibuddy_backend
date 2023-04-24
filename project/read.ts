import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const TABLE_NAME = "billibuddy-projects-table";

module.exports.handler = async (
  event
): Promise<{
  statusCode: number;
  body: string;
  headers: {};
}> => {
  console.log("GET PROJECTS EVENT: ", event);

  let body;
  let statusCode = 200;
  const headers = {};

  try {
    const id = event.requestContext.authorizer.jwt.claims.sub;

    const params = {
      TableName: TABLE_NAME,
      ExpressionAttributeValues: {
        ":id": id,
      },
      KeyConditionExpression: "id = :id",
    };

    const data = await ddbClient.send(new QueryCommand(params));
    console.log("Success :", data);
    body = data;
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers,
  };
};
