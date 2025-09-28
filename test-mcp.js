#!/usr/bin/env node

// 测试 MCP 服务器启动
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing MCP server startup...');

const serverPath = path.join(__dirname, 'dist', 'server.js');
console.log('Server path:', serverPath);

// 测试直接执行
console.log('\n1. Testing direct execution:');
const directProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    LOCAL_SERVICE_PORT: '36666',
    LOCAL_SERVICE_BASE: 'http://127.0.0.1:36666'
  }
});

directProcess.stdout.on('data', (data) => {
  console.log('Direct stdout:', data.toString());
});

directProcess.stderr.on('data', (data) => {
  console.log('Direct stderr:', data.toString());
});

directProcess.on('error', (error) => {
  console.log('Direct error:', error.message);
});

// 3秒后终止
setTimeout(() => {
  directProcess.kill();
  console.log('\nDirect execution test completed');
  
  // 测试 npx 执行
  console.log('\n2. Testing npx execution:');
  const npxProcess = spawn('npx', ['node', serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      LOCAL_SERVICE_PORT: '36666',
      LOCAL_SERVICE_BASE: 'http://127.0.0.1:36666'
    }
  });

  npxProcess.stdout.on('data', (data) => {
    console.log('NPX stdout:', data.toString());
  });

  npxProcess.stderr.on('data', (data) => {
    console.log('NPX stderr:', data.toString());
  });

  npxProcess.on('error', (error) => {
    console.log('NPX error:', error.message);
  });

  // 3秒后终止
  setTimeout(() => {
    npxProcess.kill();
    console.log('\nNPX execution test completed');
    process.exit(0);
  }, 3000);
  
}, 3000);
