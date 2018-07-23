export function connectToDb() {
  return {
    define: jest.fn().mockReturnValue({ sync: jest.fn() }),
  };
}
