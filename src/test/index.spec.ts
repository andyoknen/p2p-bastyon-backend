import request from 'supertest'
import { app } from '../app'

describe('gET /', () => {
  it('should return 200 OK', () => {
    return request(app).get('/').expect(200)
  })

  it('should return JSON with message \'Welcome to Bastyon :))\'', async () => {
    const response = await request(app).get('/')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty(
      'message',
      'Welcome to Bastyon :))',
    )
  })
})
