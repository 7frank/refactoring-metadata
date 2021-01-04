/*
{
  "getProps": {
    "testx": [
      "number",
      "import(\"/home/frank/playground-my-plugin/src/ImportedProp\").ImportedProp",
      "number[]",
      "MType"
    ],
    "__return__": "{ x: number; y: string; }"
  },
  "Button": {
    "props": {
      "test1": "string",
      "test2": {
        "xyz": "string"
      }
    },
    "__return__": "JSX.Element"
  }
}
*/


    /**
     * test for Button
     */
  import {Button}  from 'src/Button.tsx'
    

    it('renders correctly', () => {
        const tree = renderer
          .create(<Button props = {{
  "test1": "'randomString'",
  "test2": {
    "xyz": "'randomString'"
  }
}}></Button>)
          .toJSON();
        expect(tree).toMatchSnapshot();
      });
    
