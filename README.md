# React Component Generator

A Visual Studio Code extension that helps you **quickly scaffold React component folders** with a consistent file structure.

## 🚀 Installation

You don’t need to publish this extension — just install it manually using the `.vsix` file provided in this repository.

### Steps

1. Download the latest `.vsix` file from this repository (for example: `react-component-generator-0.0.1.vsix`).

2. Open **Visual Studio Code**.

3. Go to the **Extensions** view (click the square icon on the left sidebar).

4. Click the **⋯ (three dots)** menu at the top right of the Extensions pane.

5. Choose **“Install from VSIX…”**.

6. Select the `.vsix` file you downloaded.

Once installed, the extension is ready to use!

## 🧭 Usage

You can use the command from the **Command Palette** or the **Explorer context menu**.

### Option 1 — Command Palette

1. Press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows/Linux).
2. Search for **“Create Component”** and select it.
3. Enter a component name.
4. Choose the destination folder.

### Option 2 — Right-Click on a Folder

1. In the VS Code file explorer, **right-click any folder**.
2. Select **“Create Component”**.
3. Enter a component name.

## 🧩 What It Does

The extension creates a new folder with your component name and automatically generates four files inside it:

```
[ComponentName]/
├── [ComponentName].tsx
├── [ComponentName].styles.ts
├── [ComponentName].types.ts
└── [ComponentName].stories.tsx
```

Each file is pre-populated with basic boilerplate content, which you can easily customize.

## 🧑💻 Example

If you run **Create Component → MyButton**, it will generate:

```
MyButton/
├── MyButton.tsx
├── MyButton.styles.ts
├── MyButton.types.ts
└── MyButton.stories.tsx
```

## ⚙️ Requirements

- **Visual Studio Code** version 1.90.0 or higher
- **Node.js** (only needed if you plan to build/modify the extension)

## 📦 Source Project

This repository contains both the `.vsix` installation file and the original TypeScript source code.  
If you want to modify the source and build your own version:

```bash
npm install
npm run package
vsce package
```

Then you can install your newly built `.vsix` following the same steps as above.
