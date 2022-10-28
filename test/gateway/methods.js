'use strict'

const { test } = require('tap')
const Fastify = require('fastify')
const GQL = require('mercurius')
const { createGateway, buildFederationSchema } = require('../../index')

async function createService(t, schema, resolvers = {}) {
  const service = Fastify()
  service.register(GQL, {
    schema: buildFederationSchema(schema),
    resolvers
  })
  await service.listen({ port: 0 })

  return [service, service.server.address().port]
}

test('calling defineLoaders throws an error in gateway mode', async t => {
  const [service, port] = await createService(
    t,
    `
    extend type Query {
      me: User
    }

    type User @key(fields: "id") {
      id: ID!
      name: String!
    }
  `
  )

  const app = Fastify()
  t.teardown(async () => {
    await app.close()
    await service.close()
  })

  const { schema } = await createGateway(
    {
      services: [
        {
          name: 'service-1',
          url: `http://localhost:${port}/graphql`
        }
      ]
    },
    app
  )

  app.register(GQL, {
    schema
  })

  await app.ready()

  try {
    app.graphql.defineLoaders({
      Query: {
        field() {}
      }
    })
  } catch (err) {
    t.equal(
      err.message,
      'Gateway issues: Calling defineLoaders method when gateway plugin is running is not allowed'
    )
  }
})

test('calling defineResolvers throws an error in gateway mode', async t => {
  const [service, port] = await createService(
    t,
    `
    extend type Query {
      me: User
    }

    type User @key(fields: "id") {
      id: ID!
      name: String!
    }
  `
  )

  const app = Fastify()
  t.teardown(async () => {
    await app.close()
    await service.close()
  })

  const { schema } = await createGateway(
    {
      services: [
        {
          name: 'service-1',
          url: `http://localhost:${port}/graphql`
        }
      ]
    },
    app
  )

  app.register(GQL, {
    schema
  })

  await app.ready()

  try {
    app.graphql.defineResolvers({
      Query: {
        field() {}
      }
    })
  } catch (err) {
    t.equal(
      err.message,
      'Gateway issues: Calling defineResolvers method when gateway plugin is running is not allowed'
    )
  }
})

test('calling extendSchema throws an error in gateway mode', async t => {
  const [service, port] = await createService(
    t,
    `
    extend type Query {
      me: User
    }

    type User @key(fields: "id") {
      id: ID!
      name: String!
    }
  `
  )

  const app = Fastify()
  t.teardown(async () => {
    await app.close()
    await service.close()
  })

  const { schema } = await createGateway(
    {
      services: [
        {
          name: 'service-1',
          url: `http://localhost:${port}/graphql`
        }
      ]
    },
    app
  )

  app.register(GQL, {
    schema
  })

  await app.ready()

  try {
    app.graphql.extendSchema(`
      extend type Query {
        field: String!
      }
    `)
  } catch (err) {
    t.equal(
      err.message,
      'Gateway issues: Calling extendSchema method when gateway plugin is running is not allowed'
    )
    t.end()
  }
})
