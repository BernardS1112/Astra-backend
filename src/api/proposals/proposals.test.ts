import request from 'supertest'
import app from '@/App'

describe('Test the root path', () => {
  test('It should response the GET method', async () => {
    return request(app)
      .get('/proposals/APY/details')
      .then((response) => {
        expect(response.statusCode).toBe(200)
      })
  })
})
