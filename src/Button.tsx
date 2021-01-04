import React from "react";
import { ImportedProp } from "./ImportedProp";

type MType = { test: number };

let testx: number | number[] | MType = 0;
const test: string = "hello";

interface Props {
  test1: string;
  test2?:ImportedProp;
}

function getProps(testx: number | number[] | MType = 0) {
  return { x: 1, y: "2" };
}

export function Button(props: Props) {
  //  return {test:3}
  return (
    <>
      {props.test1} {getProps()}
    </>
  );
}

interface TestFunctionsInterface {
  getProps: typeof getProps;
  Button: typeof Button;
}

interface Attendee {
  id: ID;
  person: Person;
  accompaniedBy?: Person;
  status: "beginner" | "experienced" | "pro";
  accessLv: 1 | 2 | 3;
}

interface Person {
  name: string;
  isUnderage: boolean;
  address: Address;
  phoneNumbers: PhoneNumbers;
}

interface Address {
  city: City | CityCode;
  country: Country;
}

type Country = string;
type City = string;
type CityCode = number;
type ID = string;
type PhoneNumbers = string[];
