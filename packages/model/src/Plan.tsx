import { GitInfo } from './GitInfo';
import { Id } from './Id';

/**
 * Represents a plan, used to define how an SDK should be built for a specification.
 */
export interface Plan {
  /**
   * The ID of the Spec this Plan is for.
   */
  specId: Id;

  /**
   * The target language of the SDK to build. Must be one of the values in PLAN_TARGETS.
   */
  target: string;

  /**
   * The version of the SDK to build.
   */
  version?: string;

  /**
   * A JSON-like object defining any additional options that should be used to build the SDK.
   *
   * A full list of options for a given target language can be obtained from:
   * https://generator.swagger.io/api/gen/clients/<TARGET_LANGUAGE>
   */
  options?: any;

  /**
   * The current build status of the SDK.
   */
  buildStatus: BuildStatus;
  /**
   * Info about where the generated SDK will be pushed to
   */
  gitInfo?: GitInfo;
}

/**
 * Represents the different possible build statuses of a plan.
 */
export enum BuildStatus {
  NotRun = 'NOT_RUN',
  Running = 'RUNNING',
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

export const hasValidBuildStatus = buildStatus =>
  Object.values(BuildStatus).includes(buildStatus);

/**
 * An array of supported plan target languages.
 */
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
