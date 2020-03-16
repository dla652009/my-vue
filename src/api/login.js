import service from '@/utils/request';

export function GetSms(data){
    service.request({
        method:'post',
        url:'/getSms/',
        data
    })
}