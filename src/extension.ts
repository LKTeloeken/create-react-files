import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  1;
  // Register the command defined in package.json
  let disposable = vscode.commands.registerCommand(
    "react-component-generator.createComponent",
    async (uri?: vscode.Uri) => {
      // 1. Ask for the Component Name
      const componentName = await vscode.window.showInputBox({
        prompt: "Enter the Component Name (e.g., MyButton)",
        placeHolder: "MyButton",
        validateInput: (text) => {
          return text && text.length > 0 ? null : "Name cannot be empty";
        },
      });

      if (!componentName) {
        return; // User cancelled
      }

      // 2. Ask for the target Path

      let targetFolderPath: string | undefined;

      if (uri && uri.fsPath) {
        targetFolderPath = uri.fsPath;
      } else {
        targetFolderPath = await vscode.window.showInputBox({
          prompt: "Enter the path to create the component",
          placeHolder: "/path/to/your/project/src/components",
          validateInput: (text) => {
            return text && text.length > 0 ? null : "Path cannot be empty";
          },
        });
      }

      if (!targetFolderPath) {
        return; // User cancelled
      }

      // 3. Create the Logic
      try {
        await createComponent(targetFolderPath, componentName);
        vscode.window.showInformationMessage(
          `Component ${componentName} created successfully!`
        );
      } catch (error: any) {
        vscode.window.showErrorMessage(
          `Error creating component: ${error.message}`
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function createComponent(basePath: string, name: string) {
  const componentFolder = path.join(basePath, name);

  // Check if folder already exists
  if (fs.existsSync(componentFolder)) {
    throw new Error("Folder already exists!");
  }

  // Create the folder
  fs.mkdirSync(componentFolder);

  // Define file contents
  const files = {
    [`${name}.tsx`]: getTsxContent(name),
    [`${name}.styles.ts`]: getStylesContent(name),
    [`${name}.types.ts`]: getTypesContent(name), // You asked for lowercase 'name', but usually it matches component name
    [`${name}.stories.tsx`]: getStoriesContent(name),
  };

  // Write files
  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(componentFolder, fileName);
    fs.writeFileSync(filePath, content);
  }
}

// --- Content Templates ---

function getTsxContent(name: string): string {
  return `import type { ${name}Props } from './${name}.types';
import useStyles from './${name}.styles';

const ${name} = ({}: ${name}Props) => {
  const classes = useStyles();

  return <></>;
};

export default ${name};
`;
}

function getStylesContent(name: string): string {
  return `import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({}));

export default useStyles;
`;
}

function getTypesContent(name: string): string {
  return `export interface ${name}Props {}
`;
}

function getStoriesContent(name: string): string {
  return `import type { Meta, StoryObj } from '@storybook/react';
import ${name} from './${name}';

export default {
  component: ${name},
  tags: ['autodocs'],
} as Meta<typeof ${name}>;

type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {},
};
`;
}

export function deactivate() {}
