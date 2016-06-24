#!/usr/bin/env node

'use strict';

const fs = require('fs')
const program = require('commander')
const repl = require('repl')
const r = repl.start({ prompt: 'EthBox > ' })
const chalk = require('chalk')

require('repl.history')(r, process.env.HOME + '/.ethbox');


log('Welcome to Ethbox! Please wait while we do a little bootstrapping.')

program
  .option('-s, --solidityContracts [value]','solidity contracts directory')
  .parse(process.argv)

const solc = require('solc')
const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const provider = TestRPC.provider()
const web3 = new Web3(provider)

r.context.solc = solc
r.context.Web3 = Web3
r.context.TestRPC = TestRPC
r.context.provider = provider
r.context.web3 = web3

if (program.solidityContracts) {
  log('Searching for solidity contracts in', program.solidityContracts)
  const contractFiles = walkSync(program.solidityContracts)
  const sources = {}

  contractFiles.filter((contractFile) => {
    return contractFile.indexOf('.sol') !== -1
  }).forEach((contractFile) => {
    sources[contractFile.split('/').slice(-1)[0]] = fs.readFileSync(contractFile, { encoding: 'utf-8'})
  })

  const output = solc.compile({ sources: sources })

  if(output.errors) {
    output.errors.forEach(error)
    r.close()
    exit();
  }

  const contracts = {}

  Object.keys(output.contracts).forEach(function(contractName){
    contracts[contractName] = output.contracts[contractName]
    contracts[contractName].bytecode = hexify(output.contracts[contractName].bytecode)
    contracts[contractName].runtimeBytecode = hexify(output.contracts[contractName].runtimeBytecode)
    contracts[contractName].abi = JSON.parse(output.contracts[contractName].interface)
    log('Added contracts.'+contractName, 'to your environment')
  })
  r.context.contracts = contracts
}

web3.eth.getAccounts(function(err, accounts){
  web3.eth.defaultAccount = accounts[0]
  log('Set default account to', web3.eth.defaultAccount)
  log('Your EthBox is ready. Thanks for waiting!')
})

function walkSync(dir, filelist) {
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist)
    }
    else {
      filelist.push((dir+'/'+file).split('//').join('/'))
    }
  })
  return filelist;
}

function log(){
  const args = Array.prototype.slice.call(arguments).map((text) => {
    return chalk.green(text)
  })
  console.log.apply(this, args)
  r.displayPrompt()
}

function error(){
  const args = Array.prototype.slice.call(arguments).map((text) => {
    return chalk.red(text)
  })
  console.log.apply(this, args)
}

function hexify(string){
  if(string.indexOf('0x') === 0)
      return string
  else
      return '0x'+string
}

function writer(output){
  r.displayPrompt()
  return output
}