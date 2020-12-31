import React from "react";

type MType = { test: number };

let testx: number | number[] | MType = 0;
const test: string = "hello";

interface Props {
  test1: string;
}

function getProps(testx: number | number[] | MType = 0) {
  return { x: 1, y: "2" };
}

export function Button(props: Props) {
  return (
    <>
      {props.test1} {getProps()}
    </>
  );
}
