export const productionConfig = {
  frontend: {
    baseApiUrl: '/',
  },
  backend: {
    port: 80,
    useCors: false,
    initDummyData: false,
    databaseName: '',
    databaseHost: '',
    databasePort: 5432,
    databaseUsername: '',
    databasePassword: '',
  },
};
