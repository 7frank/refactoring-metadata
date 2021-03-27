import { extractInterfacesFromFile } from "tsx-ray";
var traverse = require("traverse");
const result = extractInterfacesFromFile("src/Button.tsx");
console.log("/*");
console.log(JSON.stringify(result, null, "  "));
console.log("*/");

Object.entries(result).forEach(([name, element]) => {
  const { __return__, ...props } = element as any;

  /**
   * TODO do't traverse initially as our type might be an array of types via "|" where we'd have to pick one
   */
  const dummyProps = Object.entries(props).map(([name, prop]) => {
    traverse(prop).forEach(function (x) {
      if (!this.isLeaf) return;

      const key = this.node;

      if (key == "number") this.update(Math.random());
      if (key == "string") this.update("'randomString'");
      if (this.node == "boolean") this.update(true);

      if (key == "number[]") this.update([Math.random(), Math.random()]);
      if (key == "string[]") this.update(["'randomString'", "'randomStrin2'"]);
      if (key == "boolean[]") this.update([true, false]);
    });

    const stringifiedProp = JSON.stringify(prop, null, "  ");
    return `${name} = {${stringifiedProp}}`;
  });

//   console.log("dummyProps", dummyProps);

  if (__return__ == "JSX.Element") {
    const cName = name;

    console.log(`

    /**
     * test for ${cName}
     */
  import {${cName}}  from 'src/Button.tsx'
    

    it('renders correctly', () => {
        const tree = renderer
          .create(<${cName} ${dummyProps.join(" ")}></${cName}>)
          .toJSON();
        expect(tree).toMatchSnapshot();
      });
    `);
  }
});
