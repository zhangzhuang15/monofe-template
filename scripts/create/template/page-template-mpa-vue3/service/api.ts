// define your api function here.
//
// this is an example, clear these codes when you
// start to develop.
import apiUrl from "./apiUrl";
import httpRequest from "@utils/httpRequest";

export function getUserList() {
  return httpRequest.rawRequestGet(apiUrl.userListUrl, {});
}