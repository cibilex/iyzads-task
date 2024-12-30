export const toUnixTime = (params?: Date | number, full: boolean = false) => {
  const date = params ? new Date(params) : new Date();
  return full ? date.getTime() : (date.getTime() / 1000) | 0;
};
