import request from './request'

export const saveSensorRecord = (data) =>
  request({ url: '/sensor/record', method: 'POST', data })

export const getSensorRecords = (page = 1, pageSize = 20) =>
  request({ url: '/sensor/records', method: 'GET', params: { page, pageSize } })

export const clearSensorRecords = () =>
  request({ url: '/sensor/records', method: 'DELETE' })
