{ lib, buildNpmPackage }:
buildNpmPackage {
  pname = "estflix";
  version = "0.0.1";

  src = ./.;

  npmDepsHash = lib.fakeHash;

  meta = {
    description = "estflix";
    homepage = "https://github.com/diogowho/estflix";
    license = lib.licenses.unlicense;
    maintainers = with lib.maintainers; [ ];
    mainProgram = "estflix";
  };
}
