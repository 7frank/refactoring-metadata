import { myTransform } from "./myTransform";
import type { PlaygroundPlugin, PluginUtils } from "./vendor/playground";


const makePlugin = (utils: PluginUtils) => {
  const customPlugin: PlaygroundPlugin = {
    id: "example",
    displayName: "Dev Example",
    didMount: (sandbox, container) => {
      console.log("Showing new plugin");

      // Create a design system object to handle
      // making DOM elements which fit the playground (and handle mobile/light/dark etc)
      const ds = utils.createDesignSystem(container);

      ds.title("Example Plugin");
      ds.p(
        "This plugin has a button which changes the text in the editor, click below to test it"
      );

      const startButton = document.createElement("input");
      startButton.type = "button";
      startButton.value = "Change the code in the editor";
      container.appendChild(startButton);

      startButton.onclick = () => {
        sandbox.setText("// You clicked the button!");
       // sandbox.getText()
      };

      const inferButton = document.createElement("input");
      inferButton.type = "button";
      inferButton.value = "infer probably at cursor";
      container.appendChild(inferButton);

      inferButton.onclick = async () => {
        const program = await sandbox.createTSProgram();

        // @ts-expect-error - private API
        let checker: TypeChecker = program.getDiagnosticsProducingTypeChecker();
        let sourceFile = program.getSourceFile(sandbox.filepath);
        let options = sandbox.getCompilerOptions();

    
   

        // create compiler host, program, and then emit the results
        // using our transform
        //const compilerHost = ts.createCompilerHost({})
        //const program = ts.createProgram([entryModule], compilerOptions, compilerHost)
        const msgs = {};

        const emitResult = program.emit(
          undefined,
          undefined,
          undefined,
          undefined,
          {
            before: [
              myTransform
            ],
          }
        );

        console.log(msgs)
        sandbox.setText(sandbox.getText()+JSON.stringify(msgs,null,'  '));
        

      };
    },

    // This is called occasionally as text changes in monaco,
    // it does not directly map 1 keyup to once run of the function
    // because it is intentionally called at most once every 0.3 seconds
    // and then will always run at the end.
    modelChangedDebounce: async (_sandbox, _model) => {
      // Do some work with the new text
    },

    // Gives you a chance to remove anything set up,
    // the container itself if wiped of children after this.
    didUnmount: () => {
      console.log("De-focusing plugin");
    },
  };

  return customPlugin;
};

export default makePlugin;
