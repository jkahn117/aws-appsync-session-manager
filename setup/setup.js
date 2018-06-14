
const DynamoDB = require('aws-sdk/clients/dynamodb')
const uuid = require('uuid/v4')
const faker = require('faker')

let ddb = new DynamoDB.DocumentClient({ region: 'us-east-2' })

let catalog = [
  {
    title: 'Advanced VPC Design and New Capabilities for Amazon VPC (NET305)',
    description: 'Amazon Virtual Private Cloud (Amazon VPC) enables you to have complete control over your AWS virtual networking environment. Given this control, have you ever wondered how new Amazon VPC features will affect the way you design your AWS networking infrastructure, or even change existing architectures that you use today? In this session, we explore the new design and capabilities and how you might use them?',
    sessionType: 'Breakout'
  },
  {
    title: 'Deep Dive on the Amazon Aurora PostgreSQL-compatible Edition (DAT402)',
    description: 'Amazon Aurora is a fully-managed relational database engine that combines the speed and availability of high-end commercial databases with the simplicity and cost-effectiveness of open source databases. The initial launch of Amazon Aurora delivered these benefits for MySQL. We have now added PostgreSQL compatibility to Amazon Aurora. In this session, Amazon Aurora experts discuss best practices to maximize the benefits of the Amazon Aurora PostgreSQL-compatible edition in your environment.',
    sessionType: 'Breakout'
  },
  {
    title: 'Serverless Architectural Patterns and Best Practices (ARC401)',
    description: 'As serverless architectures become more popular, customers need a framework of patterns to help them identify how they can leverage AWS to deploy their workloads without managing servers or operating systems. This session describes reusable serverless patterns while considering costs. For each pattern, we provide operational and security best practices and discuss potential pitfalls and nuances. We also discuss the considerations for moving an existing server-based workload to a serverless architecture. The patterns use services like AWS Lambda, Amazon API Gateway, Amazon Kinesis Streams, Amazon Kinesis Analytics, Amazon DynamoDB, Amazon S3, AWS Step Functions, AWS Config, AWS X-Ray, and Amazon Athena. This session can help you recognize candidates for serverless architectures in your own organizations and understand areas of potential savings and increased agility. What’s new in 2017: using X-Ray in Lambda for tracing and operational insight; a pattern on high performance computing (HPC) using Lambda at scale; how a query can be achieved using Athena; Step Functions as a way to handle orchestration for both the Automation and Batch patterns; a pattern for Security Automation using AWS Config rules to detect and automatically remediate violations of security standards; how to validate API parameters in API Gateway to protect your API back-ends; and a solid focus on CI/CD development pipelines for serverless, which includes testing, deploying, and versioning (SAM tools). ',
    sessionType: 'Breakout'
  },
  {
    title: 'A Primer on Developing Software in the Cloud (DEV320)',
    description: 'Developers are always looking for new ways to make it faster and easier to develop and release software. However, their development tools haven\'t evolved to support the highly distributed, dynamic, fast-paced development processes made possible by the cloud. In this session, we take a closer look at the tools that developers can use to improve their productivity. Through demonstrations, we showcase how developers can quickly edit, debug, and deploy applications to the cloud while collaborating with their team.',
    sessionType: 'Breakout'
  },
  {
    title: 'C5 Instances and the Evolution of Amazon EC2 Virtualization (CMP332)',
    description: 'Over the last 11 years, the Amazon EC2 virtualization platform has quietly evolved to take advantage of unique hardware and silicon, an accelerated network and storage architecture, and with the launch of C5 instances, a bespoke hypervisor to deliver the maximum amount of resources and performance to instances. Come to this deep dive to get a behind-the-scenes look at how our virtualization stack has evolved, including a peak at how our latest generation platform works under the covers. ',
    sessionType: 'Breakout'
  },
  {
    title: 'Serverless DevOps to the Rescue (SRV330)',
    description: 'Join this workshop for a crash course in serverless DevOps! This workshops presents a scenario in which you help out Wild Rydes (www.wildrydes.com), the world’s leading unicorn transportation startup! After building the first iteration of its serverless web application, Wild Rydes needs serverless DevOps experts like yourself to help it rapidly build and iterate upon its web app. In this workshop, you’ll help Wild Rydes set up a CI/CD pipeline that enables the company to rapidly build, test, and deploy changes to its serverless application. You’ll also learn to monitor and diagnose issues for its application. This workshop will teach you how to model and deploy serverless apps with the AWS Serverless Application Model. You’ll learn to use AWS CodePipeline and AWS CodeBuild to create a CI/CD pipeline for AWS Lambda and other services. Finally, you’ll learn to use AWS X-Ray to diagnose issues in your Lambda functions.',
    sessionType: 'Workshop'
  },
  {
    title: 'AWS DeepLens workshop: Building Computer Vision Applications (MCL212)',
    description: 'In this workshop, developers have the opportunity to learn how to build and deploy computer vision models, such as face detection and object analysis using the AWS DeepLens deep learning enabled video camera. By working hands-on, developers of all skill levels can explore and build their own deep learning powered, computer-vision applications. Attendees can experiment with different sample projects for face detection, object recognition, neural style transfer, and other machine learning use cases using Apache MXNet.',
    sessionType: 'Workshop'
  },
  {
    title: 'Architecting Security and Governance Across a Multi-Account Strategy (SID331)',
    description: 'Whether it is per business unit or per application, many AWS customers use multiple accounts to meet their infrastructure isolation, separation of duties, and billing requirements. In this session, we discuss considerations, limitations, and security patterns when building out a multi-account strategy. We explore topics such as identity federation, cross-account roles, consolidated logging, and account governance. Thomson Reuters shared their journey and their approach to a multi-account strategy. At the end of the session, we present an enterprise-ready, multi-account architecture that you can start leveraging today.',
    sessionType: 'Workshop'
  },
  {
    title: 'Use Amazon Lex to Build a Customer Service Chatbot in Your (DEM72)',
    description: ' Use Amazon Lex to Build a Customer Service Chatbot in Your Amazon Connect Contact Center.',
    sessionType: 'Breakout'
  },
  {
    title: 'Analytics, Authentication and Data with JavaScript: AWS Amplify (MBL403)',
    description: 'JavaScript based applications across mobile and web can be challenging to integrate with AWS services for teams that aren’t familiar with infrastructure operations. AWS Mobile has just launched a comprehensive open-source library, AWS Amplify, and tooling to help frontend and mobile developer quickly add features to their applications using a declarative programming style organized by categories of Authentication, Storage, APIs and Analytics. You’ll see how Serverless infrastructure for mobile and web applications can not only be launched in a couple of commands, but you can use the new tooling to iteratively add features and code to applications that under the covers interface with Amazon Cognito, Amazon S3, Amazon API Gateway, AWS Lambda, Amazon DynamoDB and Amazon Pinpoint. You’ll also see some framework specific techniques such as leveraging Higher Order Components (HOCs) in a React or React Native application as well as other best practices and utilities that AWS Mobile has released.',
    sessionType: 'Breakout'
  }
]

for (let session of catalog) {
  let startTime = faker.date.between('2018-06-05', '2018-06-08')

  let record = {
    SessionId: uuid(),
    Title: session.title,
    Description: session.description,
    StartTime: startTime.getTime(),
    EndTime: new Date(startTime.getTime() + 45 * 60000).getTime(),
    SessionType: session.sessionType,
    CreatedBy: faker.name.firstName()
  }

  ddb.put({
    TableName: 'SessionManager-sessions-table',
    Item: record
  }, (error, data) => {
    if (error) {
      console.error(error)
    }
  })
}
