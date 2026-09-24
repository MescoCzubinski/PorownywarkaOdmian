{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        deps = with pkgs; [ bun nodejs_22 ];

        mkApp = name: runtimeInputs: text: {
          type = "app";
          program = "${pkgs.writeShellApplication { inherit name runtimeInputs text; }}/bin/${name}";
        };
      in
      {
        devShells.default = pkgs.mkShell { packages = deps; };

        apps = {
          dev = mkApp "dev" deps ''
            bun install
            bun run dev "$@"
          '';

          gh-pages = mkApp "gh-pages" (deps ++ [ pkgs.git ]) ''
            bun run build
            bunx gh-pages -d dist
          '';
        };
      });
}
