# Structure
* Every module exists as a subfolder in the repo.

# Conventions
* Make sure to follow conventions already established in the code.
* Make sure that lint rules are always followed.
* Make sure unit tests pass.
* Never add new dependencies in package.json. You can make suggestions.
* Never mock our own code instead mock dependencies using nock, pglite, aws-sdk-mock etc.
* Do not use forEach or map instead use "for of" loops.
