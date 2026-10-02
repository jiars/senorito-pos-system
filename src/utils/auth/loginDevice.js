const LOGIN_DEVICE_KEY = "senorito_login_device_id";

export const getLoginDeviceId = () => {
  let deviceId = localStorage.getItem(LOGIN_DEVICE_KEY);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(LOGIN_DEVICE_KEY, deviceId);
  }

  return deviceId;
};
