import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const TABLE_NAME = "billibuddy-projects-table";

module.exports.handler = async (
  event
): Promise<{
  statusCode: number;
  body: string;
  headers: {};
}> => {
  console.log("UPDATE PROJECT EVENT: ", event);

  let body;
  let statusCode = 200;
  const headers = {};

  try {
    const id = event.requestContext.authorizer.jwt.claims.sub;
    const requestJSON = JSON.parse(event.body);

    const { projectToUpdate, fieldToUpdate, updateValue } = requestJSON;

    const validFieldsToUdate = [
      "projectName",
      "projectStartDate",
      "userResponseWhatLongForm",
      "userResponseWhyLongForm",
      "userResponseSacrificeLongForm",
      "userResponseHatersLongForm",
      "weeksExpectedToComplete",
      "userResponseWhyShortForm",
      "userResponseHatersShortForm",
      "daysResponseFeed",
    ];

    if (!validFieldsToUdate.includes(fieldToUpdate)) {
      throw new SyntaxError("Invalid Update Field");
    }

    const updateProjectParams = {
      TableName: TABLE_NAME,
      Key: {
        id,
        projectName: projectToUpdate,
      },
      UpdateExpression: `set ${fieldToUpdate} = :r`,
      ExpressionAttributeValues: {
        ":r": updateValue,
      },
      ReturnValues: "ALL_NEW",
    };

    const completeProjectSetUpParams = {
      TableName: TABLE_NAME,
      Key: {
        id,
        projectName: projectToUpdate,
      },
      UpdateExpression: `set ${fieldToUpdate} = :r, userCompletedSignUpFlow = :k`,
      ExpressionAttributeValues: {
        ":r": updateValue,
        ":k": true,
      },
      ReturnValues: "ALL_NEW",
    };

    // IF USER UPDATES "weeksExpectedToComplete" THEY HAVE COMPLETEED THE SIGN UP FLOW
    const params =
      fieldToUpdate === "weeksExpectedToComplete"
        ? completeProjectSetUpParams
        : updateProjectParams;

    const data = await ddbClient.send(new UpdateCommand(params));
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
