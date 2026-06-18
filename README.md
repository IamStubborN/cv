# CV Builder

Generate one or many PDF resumes from YAML files.

The repository is designed to be public-safe: fictional sample data lives in `example/`, while real resumes stay in ignored local folders under `private/`.

## Requirements

This project uses `mise` to pin the runtime:

```bash
mise install
npm install
```

The current runtime is Node.js 26.3.0.

## Data

Public sample resumes live under `example/resumes/`. The included example is `example/resumes/example.yaml`, which uses fictional data.

Keep real resumes under `private/resumes/`. The entire `private/` directory is ignored by git, so local personal data can be used without being published.

Each YAML file controls its own output filename through `fileName`. Use `skills` for the compact `Skills:` line in the header and `employment` for role-by-role experience.

The generator can render a single resume or all resumes in a directory, which makes it useful for maintaining multiple people's CVs in the same project.

## Privacy Model

- Commit only fictional examples under `example/resumes/`.
- Keep real resumes under `private/resumes/`; this folder is ignored by git.
- Generated PDFs are written to `output/`; this folder is ignored by git.
- Do not commit reference PDFs, personal contacts, or private source data.

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
npm run generate:all
```

GitHub Actions runs the same checks for pull requests and pushes to `main`, using only the public example data.
