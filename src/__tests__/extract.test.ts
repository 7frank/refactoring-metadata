import { Project } from "ts-morph";
import { extractInterfaces } from "tsx-ray";
// import { extractFunctionsFromFile } from "../yray";

function getFile(data: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  const fs = project.getFileSystem();

  const sourceFile = project.createSourceFile("file.ts", data);
  sourceFile.saveSync();
  return sourceFile;
}

describe("extract a basic interface", () => {
  const sourceFile = getFile(`
interface Address {
    city: City | CityCode;
    country: Country;
  }
  
  type Country = string;
  type City = string;
  type CityCode = number;
`);

  const result = extractInterfaces(sourceFile);

  it("is delicious", () => {
    expect(result).toEqual({
      Address: {
        city: ["string", "number"],
        country: "string",
      },
    });
  });
});



// describe("extract type of function", () => {
//     const sourceFile = getFile(`
//    function addTest(a:number,b:string)
//    {
//        return a+b
//    }
//   `);
  
//     const result = extractFunctionsFromFile(sourceFile);
  
//     it.skip("is delicious", () => {
//       expect(result).toEqual({
//         Address: {
//           city: ["string", "number"],
//           country: "string",
//         },
//       });
//     });
//   });
  