/**
 * Shared models for pipeline components
 */

export class DynamicParamsGrid {
  name: string;
  value: string;
}

export class DynamicSecretsGrid {
  name: string;
  value: string;
}

export class DynamicRuntimeGrid {
  runtype: string;
  value: Array<DynamicParamsGrid> = [];
}
