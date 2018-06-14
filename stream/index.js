const axios = require('axios')
const aws4 = require('aws4')
const util = require('util')

///
const ELASTICSEARCH_DOMAIN = process.env.ELASTICSEARCH_DOMAIN
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX

///
const postToElasticSearch = async(sessionId, record) => {
  let session = {
    SessionId: sessionId,
    Title: record.dynamodb.NewImage.Title.S,
    StartTime: Number(record.dynamodb.NewImage.StartTime.N),
    EndTime: Number(record.dynamodb.NewImage.EndTime.N),
    Description: record.dynamodb.NewImage.Description.S || '',
    SessionType: record.dynamodb.NewImage.SessionType.S,
    CreatedBy: record.dynamodb.NewImage.CreatedBy.S
  }

  let params = {
    host: ELASTICSEARCH_DOMAIN,
    method: "POST",
    url: `https://${ELASTICSEARCH_DOMAIN}/id/${ELASTICSEARCH_INDEX}/${sessionId}`,
    path: `id/${ELASTICSEARCH_INDEX}/${sessionId}`,
    body: JSON.stringify(session), // aws4 prefers 'body' to sign
    data: session // axios sends 'data'
  }

  console.log(JSON.stringify(session))

  return await axios(aws4.sign(params))
}

///
const removeFromElasticSearch = async(sessionId) => {
  let params = {
    host: ELASTICSEARCH_DOMAIN,
    method: "DELETE",
    url: `https://${ELASTICSEARCH_DOMAIN}/id/${ELASTICSEARCH_INDEX}/${sessionId}`,
    path: `id/${ELASTICSEARCH_INDEX}/${sessionId}`
  }

  return await axios(aws4.sign(params))
}

exports.handler = async (event) => {
  for(let record of event.Records) {
    console.log(util.inspect(record, { depth: 5 }))
    let sessionId = record.dynamodb.Keys.SessionId.S
    console.log(`${record.eventName} record: ${sessionId}`)

    switch(record.eventName) {
      case 'INSERT':
      case 'MODIFY':
        try {
          await postToElasticSearch(sessionId, record)
        } catch(e) {
          console.error(util.inspect(e, { depth: 5 }))
          throw new Error(e)
        }
        break
      case 'REMOVE':
        try {
          await removeFromElasticSearch(sessionId)
        } catch(e) {
          console.error(util.inspect(e, { depth: 5 }))
          throw new Error(e)
        }
        
        break
      default:
        throw new Error(`Unsupported event ${record.eventName}`)
    }
  }

  return { message: `Finished processing ${event.Records.length} records` }
}
