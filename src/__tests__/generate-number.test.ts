import { extractFunctionsFromFile } from "../yray";
import { createSimpleTests, loadFile } from "../generator/utils";
import { getFile } from "../generator/getFile";

require("jest-specific-snapshot");

describe("inc test generator", () => {
  const src = ""; //no path available

  const sourceFile = getFile(
    "file.ts",
    `
  export function inc(val: number) {
    return val++;
  }
`
  );

  const result = extractFunctionsFromFile(sourceFile);

  it("generates interface definitions", async () => {
    expect(result).toMatchSnapshot("json interface payload");
  });

  it("creates test naive cases", async () => {
    for await (const [name, element] of Object.entries(result)) {
      const resultingUnitTestCode = await createSimpleTests(
        element,
        name,
        src
      ).catch((e) => {
        expect(
          e.message + "\n\n" + sourceFile.getFullText()
        ).toMatchSpecificSnapshot(
          "./__snapshots__/mem-inc.ts/" + name + ".snap"
        );
      });
      expect(resultingUnitTestCode).toMatchSpecificSnapshot(
        "./__snapshots__/mem-inc.ts/" + name + ".snap"
      );
    }
  });
});
