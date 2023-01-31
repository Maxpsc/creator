module.exports = {
  templates: [
    {
      name: 'web-polyrepo',
      label: 'Web Polyrepo Template',
      gitRepo: 'git@github.com:Maxpsc/repo-template.git',
      templateDir: 'web-polyrepo',
			// metaDir: 'web-polyrepo/meta.json',
      params: {
        pkgName: {
          message: 'Please enter the name of this project:',
          default: '{{pkgName}}',
        },
        desc: {
          message: 'Please enter the description of this project:',
        },
        author: {
          message: 'Please enter the author of this project:',
        },
      },
    },
    {
      name: 'node-polyrepo',
      label: 'Node Polyrepo Template',
      gitRepo: 'git@github.com:Maxpsc/repo-template.git',
      templateDir: 'node-polyrepo',
      params: {
        pkgName: {
          message: 'Please enter the name of this project:',
          default: '{{pkgName}}',
        },
        desc: {
          message: 'Please enter the description of this project:',
        },
        author: {
          message: 'Please enter the author of this project:',
        },
      },
    },
	]
}
