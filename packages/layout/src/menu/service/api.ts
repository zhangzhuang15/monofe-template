import httpRequest, { type Common } from '@utils/httpRequest';
import apiUrl from './apiUrl';

export function getMenuList() {
  type MenuItem = {
    id: number,
    title: string,
    icon: string,
    url: string,
    menus: MenuItem[]
  };

  type Data = {
    menus: MenuItem[]
  };

  return httpRequest.requestGet<Common<Data>>(apiUrl.getMenuList, {});
};
