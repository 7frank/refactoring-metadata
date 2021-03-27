import { Project } from "ts-morph";
import { extractInterfaces } from "tsx-ray";

const project = new Project({ useInMemoryFileSystem: true });
const fs = project.getFileSystem();

const data = `
interface Address {
    city: City | CityCode;
    country: Country;
  }
  
  type Country = string;
  type City = string;
  type CityCode = number;
`;

const sourceFile = project.createSourceFile("file.ts", data);
sourceFile.saveSync();

describe("extract a basic interface", () => {
  const result = extractInterfaces(sourceFile);
  const x = JSON.stringify(result, null, "  ");
  console.log(x);

  it("is delicious", () => {
    expect(1).toBeTruthy();
  });
});
