#!/usr/bin/env node
const { version }= require('./package.json');
const path = require('path');
const exec = require('child_process').exec
const program = require('commander');
const replace = require('replace-in-file');
const { exit } = require('process');
const defaultBackendHost = 'http://localhost:3000';

const distDir = path.join(
  __dirname, './dist'
);

program
  .version(version)
  .command('start')
  .description('Start ArtiPub frontend server')
  .option('-h, --backendHost <host>', `backend server address, default: ${defaultBackendHost}`, defaultBackendHost)
  .option('-p, --port <port>', 'frontend static server port number', 8000)
  .action((options) => {
    //非默认就替换前端脚本中后端地址
    if (options.backendHost !== defaultBackendHost) {
      const umiIndex = path.join(distDir, './umi.*.js');
      const replaceOption = {
        files: umiIndex,
        from: defaultBackendHost,
        to: options.backendHost
      }
      
      try {
        replace.sync(replaceOption);
      } catch(error) {
        console.error(`替换 ${umiIndex} 脚本中后端地址失败，请确保有修改权限。`);
        exit(1);
      }

    }

    const setUpCmd = `npx http-server ${distDir} -p ${options.port}`;

    // 开启前端服务
    console.log(`启动命令：${setUpCmd}`)
    console.log(`访问：http://127.0.0.1:${options.port} `)
    exec(setUpCmd, { shell: true })
  })

program.parse(process.argv)
