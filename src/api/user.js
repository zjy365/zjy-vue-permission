import request from '@/utils/request'

// 用户登录
export function nlogin(data){
  return request({
    url: '/login',
    method: 'post',
    data: data
  })
}
// 获取用户权限
export function getRoles (data){
  return request({
    url: '/roles',
    method: 'POST',
    data
  })
}
