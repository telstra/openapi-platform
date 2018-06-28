export function mockObject(obj: any) {
  const mockedObj = {};
  Object.keys(obj).forEach(key => {
    if (typeof mockedObj[key] === 'function') {
      mockedObj[key] = jest.fn();
    } else {
      mockedObj[key] = obj[key];
    }
  });
  return mockedObj;
}
