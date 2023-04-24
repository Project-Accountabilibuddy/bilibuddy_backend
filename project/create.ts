import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

module.exports.handler = async (event, ctx, cb) => {
  console.log("CREATE PROJECT EVENT: ", event);

  let body;
  let statusCode = 200;
  const headers = {};

  try {
    if (!JSON.parse(event.body).projectName) {
      throw new SyntaxError("missing project name in body");
    }

    // const id = event.requestContext.authorizer.jwt.claims.sub;
    const projectName = JSON.parse(event.body).projectName;
    const today = new Date();

    // TODO: THINK ON THIS... UPDATING PROJECT NAME BLOWS OUT ALL OTHER FIELDS..
    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: "TODO",
        projectName,
        projectStartDate: today.toISOString(),
        userCompletedSignUpFlow: false,
        userResponseWhatLongForm: "",
        userResponseWhyLongForm: "",
        userResponseSacrificeLongForm: "",
        userResponseHatersLongForm: "",
        weeksExpectedToComplete: "",
        userResponseWhyShortForm: '["","",""]',
        userResponseHatersShortForm: '["","",""]',
        daysResponseFeed: "[]",
      },
    };

    const data = await ddbClient.send(new PutCommand(params));
    return data;
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
