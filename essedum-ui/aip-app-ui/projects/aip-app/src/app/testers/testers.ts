import { and, optionIs, schemaTypeIs, uiTypeIs } from "@jsonforms/core";

export const isApiControl = and(
    uiTypeIs('Control'),
    schemaTypeIs('string'),
    optionIs('api', true)
  );