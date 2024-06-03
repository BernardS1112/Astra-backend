import request from 'supertest'
import app from '@/App'
import dotenv from 'dotenv'

dotenv.config()

describe('Test the root path', () => {
  test('It should response the GET method', async () => {
    request(app)
      .get('/stakers/top')
      .then((response) => {
        console.log({ response })
        expect(response.statusCode).toBe(200)
      })
  })
})
