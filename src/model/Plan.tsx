import { Id } from 'model/Entity';

export interface Plan {
  target: string;
  version?: string;
  options?: any;
  buildStatus: BuildStatus;
  specId: Id;
}

export enum BuildStatus {
  NOTRUN,
  RUNNING,
  SUCCESS,
  FAIL,
}

export const PLAN_TARGETS = [
  'ada',
  'akka-scala',
  'android',
  'apex',
  'bash',
  'clojure',
  'cpprest',
  'csharp',
  'csharp-dotnet2',
  'cwiki',
  'dart',
  'dynamic-html',
  'eiffel',
  'elixir',
  'elm',
  'erlang-client',
  'flash',
  'go',
  'groovy',
  'haskell-http-client',
  'html',
  'html2',
  'java',
  'javascript',
  'javascript-closure-angular',
  'jaxrs-cxf-client',
  'jmeter',
  'kotlin',
  'lua',
  'objc',
  'perl',
  'php',
  'powershell',
  'python',
  'qt5cpp',
  'r',
  'ruby',
  'rust',
  'scala',
  'scalaz',
  'swagger',
  'swagger-yaml',
  'swift',
  'swift3',
  'swift4',
  'tizen',
  'typescript-angular',
  'typescript-angularjs',
  'typescript-aurelia',
  'typescript-fetch',
  'typescript-jquery',
  'typescript-node',
];
