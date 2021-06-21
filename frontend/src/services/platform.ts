import request from '@/utils/request';

export async function queryPlatformList(): Promise<any> {
  return request.get(`/platforms`);
}

export async function addPlatform(payload: any): Promise<any> {
  return request.put(`/platforms`, {data: payload});
}

export async function savePlatform(payload: any): Promise<any> {
  return request.post(`/platforms/${payload._id}`, {data: payload});
}
