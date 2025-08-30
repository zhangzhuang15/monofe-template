import { message } from "antd";

export function warnToast(msg: string) {
  message.warning(msg);
}

export function errorToast(msg: string) {
  message.error(msg);
}

export function successToast(msg: string) {
  message.success(msg);
}