import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

type ComponentType = "tailwind" | "styles";
type MaterialVersion = 4 | 5;

// Walks up from the target folder looking for the project's package.json
// and detects which Material UI version is installed.
// If both v4 (@material-ui/core) and v5 (@mui/material) are present,
// the older one (v4) wins.
function detectMaterialVersion(startPath: string): MaterialVersion {
  let current = startPath;

  while (true) {
    const pkgPath = path.join(current, "package.json");

    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
        const deps = {
          ...pkg.dependencies,
          ...pkg.devDependencies,
        };

        if (deps["@material-ui/core"]) {
          return 4;
        }
        if (deps["@mui/material"]) {
          return 5;
        }
      } catch {
        // Unreadable/invalid package.json — keep walking up
      }
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return 4; // Reached filesystem root without finding Material UI
    }
    current = parent;
  }
}

export function activate(context: vscode.ExtensionContext) {
  // Register the command defined in package.json
  let disposable = vscode.commands.registerCommand(
    "react-component-generator.createComponent",
    async (uri?: vscode.Uri) => {
      // 1. Ask which type of component to create
      const typePick = await vscode.window.showQuickPick(
        [
          {
            label: "Tailwind",
            description: "Component styled with Tailwind classes (no .styles file)",
            type: "tailwind" as ComponentType,
          },
          {
            label: "Styles file",
            description: "Component with a .styles.ts file (makeStyles)",
            type: "styles" as ComponentType,
          },
        ],
        {
          placeHolder: "Select the component type",
        }
      );

      if (!typePick) {
        return; // User cancelled
      }

      // 2. Ask for the Component Name
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

      // 3. Ask for the target Path

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

      // 4. Create the Logic
      try {
        await createComponent(targetFolderPath, componentName, typePick.type);
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

async function createComponent(
  basePath: string,
  name: string,
  type: ComponentType
) {
  const componentFolder = path.join(basePath, name);

  // Check if folder already exists
  if (fs.existsSync(componentFolder)) {
    throw new Error("Folder already exists!");
  }

  // Create the folder
  fs.mkdirSync(componentFolder);

  // For styles components, check which Material UI version the project uses
  const materialVersion =
    type === "styles" ? detectMaterialVersion(basePath) : undefined;

  // Define file contents
  const files: Record<string, string> = {
    [`${name}.types.ts`]: getTypesContent(name),
  };

  if (type === "tailwind") {
    files[`${name}.tsx`] = getTailwindTsxContent(name);
    files[`${name}.stories.tsx`] = getStoriesContent(name);
  } else if (materialVersion === 5) {
    files[`${name}.tsx`] = getMui5TsxContent(name);
    files[`${name}.styles.ts`] = getMui5StylesContent(name);
    files[`${name}.stories.tsx`] = getMui5StoriesContent(name);
  } else {
    // Material UI v4 (or none detected) — current pattern
    files[`${name}.tsx`] = getTsxContent(name);
    files[`${name}.styles.ts`] = getStylesContent(name);
    files[`${name}.stories.tsx`] = getStoriesContent(name);
  }

  // Write files
  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(componentFolder, fileName);
    fs.writeFileSync(filePath, content);
  }
}

// --- Content Templates ---

function getTailwindTsxContent(name: string): string {
  return `import type { ${name}Props } from './${name}.types';

const ${name} = ({}: ${name}Props) => {
  return <></>;
};

export default ${name};
`;
}

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

// --- Material UI v5 templates ---

function getMui5TsxContent(name: string): string {
  return `import { ${name}Props } from "./${name}.types";
import useStyles from "./${name}.styles";

const ${name} = ({}: ${name}Props) => {
  const styles = useStyles();

  return <></>;
};

export default ${name};
`;
}

function getMui5StylesContent(name: string): string {
  return `const useStyles = () => {
  return {};
};

export default useStyles;
`;
}

function getMui5StoriesContent(name: string): string {
  return `import type { Meta, StoryObj } from "@storybook/react";
import { ${name}Props } from "./${name}.types";
import ${name} from "./${name}";

const meta = {
  component: ${name},
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ${name}>;

export default meta;

type Story = StoryObj<typeof meta>;

const render = (args: ${name}Props) => {
  return <${name} {...args} />;
};

export const Default: Story = {
  args: {},
  render,
};
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
