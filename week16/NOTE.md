1. scaffolding
Yeoman tutorial
https://yeoman.io/authoring/

A global module may be created and symlinked to a local one, using npm

Every method added to the prototype is run once the generator is called–and usually in sequence.

Instead, always rely on the UI generic this.log() method, where this is the context of your current generator.


As asynchronous APIs are harder to use, Yeoman provide a synchronous file-system API where every file gets written to an in-memory file system and are only written to disk once when Yeoman is done running.

