import { extractInterfaces } from "../xray";
import { extractFunctionsFromFile } from "../yray";
import { getFile } from "../generator/getFile";

describe("extract a basic interface", () => {
  const sourceFile = getFile(
    "file.ts",
    `
interface Address {
    city: City | CityCode;
    country: Country;
  }
  
  type Country = string;
  type City = string;
  type CityCode = number;
`
  );

  const result = extractInterfaces(sourceFile);

  it("return the correct", () => {
    expect(result).toEqual({
      Address: {
        city: ["string", "number"],
        country: "string",
      },
    });
  });
});

describe("extract type of function", () => {
  const sourceFile = getFile(
    "file.ts",
    `
   function addTest(a:number,b:string)
   {
       return a+b
   }
  `
  );

  const result = extractFunctionsFromFile(sourceFile);

  it("does so", () => {
    expect(result).toEqual({
      addTest: {
        __return__: "string",
        a: "number",
        b: "string",
      },
    });
  });
});
