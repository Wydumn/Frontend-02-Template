var Generator = require('yeoman-generator');


module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);

        // Next, add your custom code
        this.option('babel'); // This method adds support for a `--babel` flag

    }

    initPackage() {
        const pkgJson = {
            devDependencies: {
                eslint: '^3.15.0'
            },
            dependencies: {
                react: '^16.2.0'
            }
        }

        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

        this.npmInstall();
    }

    async prompting() {
        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('public/index.html'),
            { title: 'Templating with Yeoman' }
        );
    }

    
};