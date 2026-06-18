# CV Builder

Generate one or many PDF resumes from YAML files.

## Requirements

This project uses `mise` to pin the runtime:

```bash
mise install
npm install
```

## Data

Public sample resumes live under `example/resumes/`. The included example is `example/resumes/example.yaml`, which uses fictional data.

Keep real resumes under `private/resumes/`. The entire `private/` directory is ignored by git, so local personal data can be used without being published.

Each YAML file controls its own output filename through `fileName`. Use `skills` for the compact `Skills:` line in the header, `employment` for current relevant roles, and optional `earlierExperience` for compact older experience.

## Commands

```bash
npm run generate:all
npm run generate:example
npm run generate:private
npm run generate -- --resume example/resumes/example.yaml
npm run generate -- --resume private/resumes/your-name.yaml
```

Generated PDFs are written to `output/`.

## Checks

```bash
npm test
npm run build
```
