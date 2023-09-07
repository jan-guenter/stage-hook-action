const process = require('process')
const child_process = require('node:child_process')
const os = require('os')
const fs = require('fs')

function setPhase(phase) {
    fs.appendFileSync(process.env['GITHUB_STATE'], `ACTION_PHASE=${phase}${os.EOL}`, {
        encoding: 'utf8'
    })
}

const phase = process.env['STATE_ACTION_PHASE'] ?? 'pre'

console.log(`Phase: ${phase}`)

let exitCode = 0

switch (phase) {
    case 'pre':
        const precommand = process.env['INPUTS_PRE-COMMAND']
        if (precommand) {
            const preargs = (process.env['INPUTS_PRE-ARGS'] ?? '').split('\n')
            const preproc = child_process.spawnSync(precommand, preargs, { stdio: 'inherit', encoding: 'utf-8' } )
            if (preproc.status) {
                exitCode = preproc.status
            }
        }
        setPhase('main')
        break
    case 'main':
        const maincommand = process.env['INPUTS_MAIN-COMMAND']
        if (maincommand) {
            const mainargs = (process.env['INPUTS_MAIN-ARGS'] ?? '').split('\n')
            const mainproc = child_process.spawnSync(maincommand, mainargs, { stdio: 'inherit', encoding: 'utf-8' } )
            if (mainproc.status) {
                exitCode = mainproc.status
            }
        }
        setPhase('post')
    case 'post':
        const postcommand = process.env['INPUTS_POST-COMMAND']
        if (postcommand) {
            const postargs = (process.env['INPUTS_POST-ARGS'] ?? '').split('\n')
            const post_proc = child_process.spawnSync(postcommand, postargs, { stdio: 'inherit', encoding: 'utf-8' } )
            if (post_proc.status) {
                exitCode = post_proc.status
            }
        }
        break
}

console.log(`Exit code: ${exitCode}`)

process.exit(exitCode)
