import { extractFunctionsFromFile } from "../yray";
import { createSimpleTests, loadFile } from "../generator/utils";

describe("extract type of function of file", () => {
  const src = "src/fixtures/Button.tsx";
  const result = extractFunctionsFromFile(loadFile(src));

  it("does so & creates simple test cases", () => {
    expect(result).toMatchSnapshot("json interface 3payload");

    Object.entries(result).forEach(([name, element]) => {
      const resultingUnitTestCode = createSimpleTests(element, name, src);

      expect(resultingUnitTestCode).toMatchSnapshot(name);
    });
  });
});
