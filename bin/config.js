module.exports = {
  templates: [
    {
      name: 'web-polyrepo',
      label: 'Web Polyrepo Template',
      gitRepo: 'git@github.com:Maxpsc/repo-template.git',
      templateDir: 'web-polyrepo',
			metaDir: 'web-polyrepo/meta.json',
      params: {
        pkgName: {
          message: 'Please enter the project name:',
          default: '<%= dirname %>',
        },
        desc: {
          message: 'Please enter the description of this project:',
        },
        author: {
          message: 'Please enter the author of this project:',
          default: '<%= author %>',
        },
      },
    },
	]
}
