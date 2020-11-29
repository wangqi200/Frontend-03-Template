/*
 * @Author: your name
 * @Date: 2020-11-29 22:26:56
 * @LastEditTime: 2020-11-29 22:35:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /Frontend-03-Template/week17/generators/app/index.js
 */
var Generator = require('yeoman-generator');
module.exports = class extends Generator {
  // The name `constructor` is important here
  constructor(args, opts) {
    // Calling the super constructor is important so our generator is correctly set up
    super(args, opts);
  }

  // async method1() {
  //   const answers = await this.prompt([
  //     {
  //       type: "input",
  //       name: "name",
  //       message: "Your project name",
  //       default: this.appname // Default to current folder name
  //     },
  //     {
  //       type: "confirm",
  //       name: "cool",
  //       message: "Would you like to enable the Cool feature?"
  //     }
  //   ]);


  //   this.log("app name", answers.name);
  //   this.log("cool feature", answers.cool);
  // }

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
    this.npmInstall()
  }

  // step1() {
  //   this.fs.copyTpl(
  //     this.templatePath('t.html'),
  //     this.destinationPath('public/index.html'),
  //     { title: 'Templating with Yeoman' }
  //   );
  // }
};
