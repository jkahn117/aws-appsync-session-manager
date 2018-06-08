const axios = require('axios')
const aws4 = require('aws4')
const util = require('util')

///
const ELASTICSEARCH_DOMAIN = process.env.ELASTICSEARCH_DOMAIN
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX

///
const postToElasticSearch = async(sessionId, record) => {
  let params = {
    host: ELASTICSEARCH_DOMAIN,
    method: "POST",
    url: `https://${ELASTICSEARCH_DOMAIN}/id/${ELASTICSEARCH_INDEX}/${sessionId}`,
    path: `id/${ELASTICSEARCH_INDEX}/${sessionId}`,
    body: JSON.stringify(record), // aws4 prefers 'body' to sign
    data: record // axios sends 'data'
  }

  return await axios(aws4.sign(params))
}

exports.handler = async (event) => {
  // console.log(util.inspect(event, { depth: 5 }))

  for(let record of event.Records) {
    // console.log(util.inspect(record, { depth: 5 }))
    let sessionId = record.dynamodb.Keys.SessionId.S

    if (record.eventName === 'INSERT') {
      let title = record.dynamodb.NewImage.Title.S
      let description = record.dynamodb.NewImage.Description.S || ''

      try {
        await postToElasticSearch(sessionId, {
          SessionId: sessionId,
          Title: record.dynamodb.NewImage.Title.S,
          StartTime: record.dynamodb.NewImage.StartTime.S,
          EndTime: record.dynamodb.NewImage.EndTime.S,
          Description: description,
          SessionType: record.dynamodb.NewImage.SessionType.S,
          CreatedBy: record.dynamodb.NewImage.CreatedBy.S
        })
      } catch (e) {
        console.error(`[ERROR] ${e.message}`)
        console.error(`[ERROR DETAIL] ${e.response.data.message || e.response.data.error}`)
      }
      
    } else if (record.eventName == 'REMOVE') {
      // remove from ES
    }
  }

  return { message: `Finished processing ${event.Records.length} records` }
}
