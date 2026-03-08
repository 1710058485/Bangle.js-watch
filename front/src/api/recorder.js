import request from './request'

export const uploadTrack = (filename, rawCsv) => {
  return request({
    url: '/recorder/upload',
    method: 'POST',
    data: { filename, rawCsv }
  })
}

export const getTracks = () => {
  return request({ url: '/recorder/tracks', method: 'GET' })
}

export const deleteTrack = (id) => {
  return request({ url: `/recorder/tracks/${id}`, method: 'DELETE' })
}
