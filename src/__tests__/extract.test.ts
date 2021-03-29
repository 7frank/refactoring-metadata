import { Project } from "ts-morph";
import { extractInterfaces } from "../xray";
import { extractFunctionsFromFile } from "../yray";
import { loadFile } from "../generator/utils";

function getFile(src, data: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  //  const fs = project.getFileSystem();

  const sourceFile = project.createSourceFile(src, data);
  project.addDirectoryAtPathIfExists("../fixtures");

  sourceFile.saveSync();
  return sourceFile;
}

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

describe("extract type of function of file", () => {
  //  Note run ts-node src/index2 with below code enabled

  const src = "src/fixtures/Button.tsx";
  const result = extractFunctionsFromFile(loadFile(src));

  // console.log('/*');
  // console.log(JSON.stringify(result, null, '  '));
  // console.log('*/');
  //
  // Object.entries(result).forEach(([name, element]) => {
  //     createSimpleTests(element, name);
  //
  // });
  //
  it("does so", () => {
    expect(result).toMatchSnapshot();
  });
});
