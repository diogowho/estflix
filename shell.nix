{
  mkShellNoCC,
  nodejs,
  prettierd,
  vtsls,
  callPackage,
}:
let
  defaultPackage = callPackage ./default.nix { };
in
mkShellNoCC {
  inputsFrom = [ defaultPackage ];

  packages = [
    nodejs
    prettierd
    vtsls
  ];
}
