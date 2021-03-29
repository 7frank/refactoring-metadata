import * as ts from "typescript";
import * as path from "path";
import type { InterfaceDefinition } from "../xray/types";
import { Project } from "ts-morph";

var jsonic = require("jsonic");

var traverse = require("traverse");

/**
 * Note run ts-node src/index2
 * TODO create separate package with unit tests for cases
 * initial setup: parse file
 *
 *  1 write tests that extract jsx function
 *  2 run it through a template that generates a jest test
 *  3 have a function that executes the test directly
 *  4 ( use 3 together with an option to only generate valid test from file)
 *
 *  1 write test that extracts potential unit test candidates
 *  2 unit test template
 *  3 createtest data & compilefile containing function % execute it
 *  4 create unit test from 2 & 3
 *
 *
 * x we need recursion to resolve "function" params
 */

export function loadFile(filepath: string, project?: Project) {
  project =
    project ??
    new Project({
      compilerOptions: {
        jsx: 2,
      },
    });
  return project.addSourceFileAtPath(filepath);
}

/**
 * this is a really rough draft of things we might wanna do
 */
export function createSimpleTests(
  element: InterfaceDefinition,
  name: string,
  src: string
) {
  const { __return__, ...props } = element as any;

  /**
   * TODO don't traverse initially as our type might be an array of types via "|" where we'd have to pick one
   */

  let dummyProps = createDummyProps(props);

  // todo run prettier before out
  if (__return__ == "JSX.Element") {
    return createReactTest({ name, path: "", props: dummyProps });
  } else if (__return__ != "JSX.Element") {
    // TODO random values obviously will fail BUT we actually can compile the file
    //  and its dependencies and run it with random input and
    const returnValue = createDummyProps(jsonic(__return__ as string));

    const test = createRandomFunctionCall({
      name,
      path: extractDummyPath(src),
      params: createDummyParams(props),
    });
    runMemoryTest(test);

    return createUnitTest({
      name,
      path: "",
      props: dummyProps,
      returnValue,
    });
  }
}

function extractDummyPath(src) {
  const f = path.basename(src);

  return f.split(".").slice(0, -1).join(".");
}

function createDummyProps(props) {
  const dummyProps = Object.entries(props).map(([name, prop]) => {
    traverse(prop).forEach(function (x) {
      if (!this.isLeaf) return;

      const key = this.node;

      if (key == "number") this.update(Math.random());
      if (key == "string") this.update("randomString");
      if (this.node == "boolean") this.update(true);

      if (key == "number[]") this.update([Math.random(), Math.random()]);
      if (key == "string[]") this.update(["'randomString'", "'randomStrin2'"]);
      if (key == "boolean[]") this.update([true, false]);
    });

    const stringifiedProp = JSON.stringify(prop, null, "  ");
    return `${name} = {${stringifiedProp}}`;
  });
  return dummyProps;
}

function createDummyParams(props) {
  traverse(props).forEach(function (x) {
    if (!this.isLeaf) return;

    const key = this.node;

    if (key == "number") this.update(Math.random());
    if (key == "string") this.update("randomString");
    if (this.node == "boolean") this.update(true);

    if (key == "number[]") this.update([Math.random(), Math.random()]);
    if (key == "string[]") this.update(["'randomString'", "'randomStrin2'"]);
    if (key == "boolean[]") this.update([true, false]);
  });
  return Object.values(props).map((entry) => JSON.stringify(entry, null, "  "));
}

function createReactTest({
  name,
  path,
  props,
}: {
  name: string;
  path: string;
  props: string[];
}) {
  const cName = name;

  const out = `

    /**
     * test for ${cName}
     */
  import {${cName}}  from './Button.tsx'
    

    it('renders correctly', () => {
       // arrange
       const randomTestProps=${props.join(" ")}
   
       // act
        const tree = renderer
          .create(<${cName} {...randomTestProps} ></${cName}>)
          .toJSON();
        
        // assert
        expect(tree).toMatchSnapshot();
      });
    `;

  return out;
}

function createUnitTest({
  name,
  path,
  props,
  returnValue,
}: {
  name: string;
  path: string;
  props: string[];
  returnValue: string[];
}) {
  const cName = name;

  const out = `

    /**
     * test for ${cName}
     */
  import {${cName}}  from './Button.tsx'
    

    it('renders correctly', () => {
       // arrange
       const randomTestProps=${props.join(" ")}
   
       // act
      const result= ${cName}(randomTestProps)
        
        // assert
        expect(result).toBeEqual(${returnValue.join(" ")});
      });
    `;

  return out;
}

function createRandomFunctionCall({
  name,
  path,
  params,
}: {
  name: string;
  path: string;
  params: string[];
}) {
  const cName = name;

  return `

   import {${cName}}  from './${path}'
 
   const randomTestProps=[${params.join(",")}];
  
   ${cName}(...randomTestProps)
      
`;
}

/**
 * we probably ned to run a whole compilation of complex sources in a memory or ramdisk file system
 * @param source
 */
async function runMemoryTest(source: string) {
  //  const source = 'let x: string  = \'string\'';

  let result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });

  console.log("/------------------------------------/");
  console.log(source);
  console.log("/------------------------------------/");
  console.log(JSON.stringify(result));
  console.log("/------------------------------------/");
  console.log(result.outputText);
  console.log("/------------------------------------/");
  try {
    const testResult = eval(result.outputText);
    console.log("testResult:");
    console.log(JSON.stringify(testResult));
  } catch (e) {
    console.log("Error on Eval", e);
  }

  console.log("/------------------------------------/");
}
