import React from "react";

/*********************************************************************************************************
 * This file contains some reaaally basic functions
 * of which the tests will generate itself unit tests for
 *
 * TODO we should create separate unit tests for each edge case later on
 *********************************************************************************************************/

/**
 * increment value by one
 */
export function inc(val: number) {
  return val++;
}

/**
 * hello name example

 */
export function helloName(name: string) {
  return `hello, ${name}`;
}

/**
 * function containing optional value with dependent return type
 * FIXME yray will return wrong values here
 */
export function optional(val?: string) {
  return val ? "yes" : 0;
}

/**
 * TODO decide how to handle functions. (1) do we want to mock them or (2) use jest-chance to generate example data
 * @param cb
 */
export function execCallback(cb: () => string) {
  return `callback result:${cb()}`;
}

type ExampleViewProps = {
  a: string;
  b: number;
  c: (x: string) => boolean;
  d: boolean;
  e: "A" | "B" | "C";
};

export function ExampleView({ a, b, c, d, e }: ExampleViewProps) {
  return (
    <>
      {b}
      {c(a)}
      {d}
      {e}
    </>
  );
}
