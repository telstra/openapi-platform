export function connectToDb() {
  return {
    define: jest.fn().mockReturnValue({
      sync: jest.fn(),
      // Note: This is obviously wrong, but the only reason it needs to exist is to stop the initDummyData check from crashing
      count: jest.fn().mockReturnValue(1),
    }),
  };
}
