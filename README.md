# Porównywarka Odmian

Narzędzie do porównywania odmian słów.

## Wymagania

- [Nix](https://nixos.org/) (opcjonalnie, dla `shell.nix`)
- [Bun](https://bun.sh/) (dostępny w `nix-shell`)

## Uruchomienie

```bash
nix-shell
bun install
bun dev
```

## Skrypty

| Skrypt | Opis |
|--------|------|
| `bun dev` | Serwer deweloperski |
| `bun build` | Build produkcyjny |
| `bun preview` | Podgląd buildu |
| `bun lint` | Lint (oxlint) |

## Stack

- Bun
- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui
