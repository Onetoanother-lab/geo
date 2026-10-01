# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

There is no application code here yet, so there are no build, lint or test commands. When code is added, record its commands here. Right now the repo only holds the Claude Code skill and plugin setup under `.claude/`.

## Skills and plugins

### Project skills (`.claude/skills/<name>/SKILL.md`)

These are copied into the repo and load automatically:

- `scrollytelling`: written from the docs and source of [basementstudio/scrollytelling](https://github.com/basementstudio/scrollytelling) (`@bsmnt/scrollytelling`, a React wrapper around GSAP ScrollTrigger). That repo ships no skill of its own. Where its docs and source disagree (for example, `Pin` takes `childHeight`), the skill follows the source.
- 144 skills from [dylantarre/animation-principles](https://github.com/dylantarre/animation-principles), commit `8359713`. They apply Disney's 12 animation principles, in 12 upstream categories: domain, thinking style, role, skill level, animation type, emotion, UI element, industry, tool/framework, time scale, principle and problem type. Here they sit in one flat folder because Claude Code only finds skills one level deep. Upstream calls them `animation-principles:<name>`; here they are just `<name>`. The 12 skill-level skills had invalid names ("Animation Principles - Novice") or generic ones (`quick-start`, `troubleshooting`), so they were renamed `animation-<level>` (`animation-novice`, `animation-expert`, …). Each category has a `universal-*` fallback.

The upstream MIT licenses are in `.claude/vendor-licenses/`.

### Plugins (`.claude/settings.json`)

The `anthropic-agent-skills` marketplace (`anthropics/skills`) is registered, with two plugins turned on:

- `document-skills`: xlsx, docx, pptx, pdf
- `example-skills`: frontend-design, skill-creator, mcp-builder, webapp-testing, web-artifacts-builder, canvas-design, algorithmic-art, theme-factory, brand-guidelines, internal-comms, doc-coauthoring, slack-gif-creator

The plugins are pulled from GitHub when Claude Code starts in this repo, not stored here. Some of them (the document skills) are not openly licensed, so don't copy their files into the repo.

### When the user names or links a skill

1. If it's already available (project skill, plugin or built-in), invoke it.
2. If it's a GitHub repo or URL, clone it and look for `SKILL.md` files or a `.claude-plugin/marketplace.json`:
   - If there's a marketplace, add it to `extraKnownMarketplaces` / `enabledPlugins` in `.claude/settings.json` rather than copying files.
   - If there are only `SKILL.md` files, copy each skill folder flat into `.claude/skills/<name>/`. Make sure each frontmatter `name` matches its folder and is lowercase-hyphenated, and save the upstream license in `.claude/vendor-licenses/`.
   - If it's a library with no skill, write a `SKILL.md` from its docs and check the facts against its source.
3. Note the source and commit in this file.

Skills added mid-session become discoverable only in the next session. Until then, read the `SKILL.md` and follow it directly.
