<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Background music uses a browser-only Web Audio player managed by a React hook; this keeps single-player audio offline and honors saved settings and page visibility.
- Background selection is centralized in a browser-safe module; gameplay follows the played level and menus follow unlocked progress so returning to menus preserves the current world.
- Worlds (names, 20-level ranges) live in a browser-safe worlds module; level data is generated offline into the words data file and guarded by tests for count, letter fit and no singular/plural pairs.
