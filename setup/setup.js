
const DynamoDB = require('aws-sdk/clients/dynamodb')
const uuid = require('uuid/v4')
const faker = require('faker')

let ddb = new DynamoDB.DocumentClient({ region: 'us-east-2' })


function fakeSession() {
  let startTime = faker.date.between('2018-06-05', '2018-06-08')

  return {
    SessionId: uuid(),
    Title: faker.lorem.sentence(),
    Description: faker.lorem.sentences(4),
    StartTime: startTime.toISOString(),
    EndTime: new Date(startTime.getTime() + 45 * 60000).toISOString(),
    SessionType: 'Breakout',
    Presenter: faker.name.findName(),
    PresenterTitle: faker.name.jobTitle(),
    PresenterAvatar: faker.image.avatar(),
    CreatedBy: faker.name.firstName()
  }
}

for (let i = 0; i < 20; i++) {
  ddb.put({
    TableName: 'SessionManager-sessions-table',
    Item: fakeSession()
  }, (error, data) => {
    if (error) {
      console.error(error)
    }
  })
}