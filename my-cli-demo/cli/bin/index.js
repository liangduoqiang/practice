#!/usr/bin/env node

const commander = require('commander')
const inquirer = require('inquirer')
const chalk = require('chalk')
const downloadProjectTemplate = require('./download')

const version = require('../package.json').version
commander.version(version, '-v --version')

commander.command('create <name>')
         .action(projectName => {
             inquirer.prompt([
                 {
                     type: 'confirm',
                     message: chalk.red('你确定开始下载模板吗'),
                     name: 'isDownload'
                 }
             ])
                     .then(({ isDownload }) => {
                         isDownload && downloadProjectTemplate(projectName)
                     })
         })

commander.parse(process.argv)