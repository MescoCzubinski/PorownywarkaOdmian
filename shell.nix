{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [ pkgs.nodejs_22 pkgs.http-server ];

  shellHook = ''
    run() {
      npm run bulid &
      trap "kill $!" EXIT
      http-server ./src -p 8080
    }
  '';
}
