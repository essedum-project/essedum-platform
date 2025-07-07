// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  dataUrl: '/api',
  dashUrl: '/api',
  baseUrl: '/api',
  datasetsUrl: '/api',
  title: 'Essedum Cyber Security Analytics',
  production: false,
  dashboardTest: {
    production: false,
    productName: "Dynamic Dashboard Framework",
    productVersion: "0.0.5",
    menu: {
      documentation: true,
      aiSearch: true,
      notification: true
    },
    boardConfiguration: {
      board: true,
      ai: true,
      endpoint: true
    }
  },
  videoUrl: 'https://13.78.183.109:4200/',
  locale: 'en-US',
  sse: true,
  configUrls: ['configs/config.json', 'configs/auth-config.json', 'configs/widget-config.json'],
  microAppModule: true
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
