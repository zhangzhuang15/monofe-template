import httpRequest, { type Common } from '@utils/httpRequest';
import apiUrl from './apiUrl';

export function getWhoami() {
  type Data = {
    userName: string;
    userID: string;
    avatarUrl: string;
  }
  return httpRequest.requestGet<Common<Data>>(apiUrl.whoami, {});
};