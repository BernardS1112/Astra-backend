import request from 'supertest'
import app from '@/App'

describe('Test the root path', () => {
  // test('It should response the GET method', async () => {
  //   return request(app)
  //     .get('/indices/paginated')
  //     .then((response) => {
  //       expect(response.statusCode).toBe(200)
  //     })
  // })
  test('Get Specific Index', async () => {
    return request(app)
      .get(`/indices/performance/0x7C26316949cd9f815486db62D388B6d0f3F2C438`)
      .then((response) => {
        expect(response.statusCode).toBe(200)
      })
  })
})
