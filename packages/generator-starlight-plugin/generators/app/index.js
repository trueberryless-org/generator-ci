"use strict";
const Generator = require("yeoman-generator");
const yosay = require("yosay");
import camelCase from "camelcase";

module.exports = class extends Generator {
  initializing() {
    this.log(
      yosay(
        `Welcome to the @trueberryless-org/generator-starlight-plugin generator!`
      )
    );
  }

  prompting() {
    const prompts = [
      {
        type: "input",
        name: "repositoryName",
        message: "What is the name of the your Starlight plugin?",
        default: this.appname
      },
      {
        type: "input",
        name: "githubOwner",
        message: "What is your GitHub username or organization?",
        default: "trueberryless-org"
      },
      {
        type: "input",
        name: "defaultBranch",
        message: "What is the default branch?",
        default: "main"
      },
      {
        type: "input",
        name: "dockerRegistry",
        message: "To which Docker registry should the image be pushed?",
        default: "docker.io"
      },
      {
        type: "input",
        name: "dockerOwner",
        message:
          "What is the Docker username or organization the image should be pushed to?",
        default: "trueberryless"
      },
      {
        type: "input",
        name: "description",
        message: "What is your Starlight plugin for?"
      },
      {
        type: "input",
        name: "documentationFolder",
        message: "In which directory is your documentation?"
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {
    this.fs.copyTpl(
      this.templatePath("LICENSE"),
      this.destinationPath("LICENSE"),
      {
        year: new Date().getFullYear(),
        githubOwner: this.props.githubOwner
      }
    );

    {
      this.fs.copyTpl(
        this.templatePath(".changeset/config.json"),
        this.destinationPath(".changeset/config.json"),
        {
          githubOwner: this.props.githubOwner,
          repositoryName: this.props.repositoryName
        }
      );
      this.fs.copy(
        this.templatePath(".changeset/README.md"),
        this.destinationPath(".changeset/README.md")
      );
    }

    {
      this.fs.copyTpl(
        this.templatePath(".github/workflows/welcome-bot.yaml"),
        this.destinationPath(".github/workflows/welcome-bot.yaml"),
        {
          defaultBranch: this.props.defaultBranch
        }
      );
      this.fs.copyTpl(
        this.templatePath(".github/workflows/release.yaml"),
        this.destinationPath(".github/workflows/release.yaml"),
        {
          defaultBranch: this.props.defaultBranch,
          githubOwner: this.props.githubOwner
        }
      );
      this.fs.copyTpl(
        this.templatePath(".github/workflows/deployment.yaml"),
        this.destinationPath(".github/workflows/deployment.yaml"),
        {
          defaultBranch: this.props.defaultBranch,
          dockerRegistry: this.props.dockerRegistry,
          dockerOwner: this.props.dockerOwner,
          repositoryName: this.props.repositoryName,
          documentationFolder: this.props.documentationFolder
        }
      );
      this.fs.copyTpl(
        this.templatePath(".github/workflows/publish.yaml"),
        this.destinationPath(".github/workflows/publish.yaml"),
        {
          defaultBranch: this.props.defaultBranch,
          dockerRegistry: this.props.dockerRegistry,
          dockerOwner: this.props.dockerOwner,
          repositoryName: this.props.repositoryName
        }
      );
    }

    {
      const pkgPath = this.destinationPath("package.json");

      if (!this.fs.exists(pkgPath)) {
        this.fs.copy(this.templatePath("package.json"), pkgPath);
      }

      const pkg = this.fs.readJSON(pkgPath, {});

      pkg.scripts = {
        ...pkg.scripts,
        version: "pnpm changeset version && pnpm i --no-frozen-lockfile"
      };

      this.fs.writeJSON(pkgPath, pkg);
    }

    {
      const pluginPath = `packages/${this.props.repositoryName}`;

      this.fs.copyTpl(
        this.templatePath("packages/plugin"),
        this.destinationPath(pluginPath),
        {
          repositoryName: this.props.repositoryName,
          githubOwner: this.props.githubOwner,
          documentationFolder: this.props.documentationFolder,
          importName: camelCase(this.props.repositoryName)
        }
      );
    }

    {
      const docsPath = `${this.props.documentationFolder}`;

      if (!this.fs.exists(this.destinationPath(docsPath))) {
        this.fs.copyTpl(
          this.templatePath("docs"),
          this.destinationPath(docsPath),
          {
            repositoryName: this.props.repositoryName,
            githubOwner: this.props.githubOwner,
            importName: camelCase(this.props.repositoryName)
          }
        );
      }
    }
  }

  install() {
    this.env.options.nodePackageManager = "pnpm";
    this.installDependencies();
  }

  end() {
    this.log("Done!");
  }
};
