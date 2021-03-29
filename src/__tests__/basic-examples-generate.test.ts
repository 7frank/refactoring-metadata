import { extractFunctionsFromFile } from "../yray";
import { createSimpleTests, loadFile } from "../generator/utils";

require("jest-specific-snapshot");

describe("basic examples test generator", () => {
  const src = "src/fixtures/basic-examples.tsx";
  const sourcefile = loadFile(src);
  const result = extractFunctionsFromFile(sourcefile);

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
          e.message + "\n\n" + sourcefile.getFullText()
        ).toMatchSpecificSnapshot(
          "./__snapshots__/basic-examples.tsx/" + name + ".snap"
        );
      });
      expect(resultingUnitTestCode).toMatchSpecificSnapshot(
        "./__snapshots__/basic-examples.tsx/" + name + ".snap"
      );
    }
  });
});
