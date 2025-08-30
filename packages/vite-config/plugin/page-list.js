import fs from 'fs';
import path from 'path';


// 默认的展示模板
function getDefaultTemplate() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Pages List</title>
  <style>
    :root {
      --primary-color: #646cff;
      --hover-color: #747bff;
      --bg-color: #ffffff;
      --text-color: #213547;
      --border-color: #eaeaea;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #1a1a1a;
        --text-color: rgba(255, 255, 255, 0.87);
        --border-color: #333;
      }
    }

    body { 
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background-color: var(--bg-color);
      color: var(--text-color);
    }

    h1 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 2rem;
      background: linear-gradient(120deg, var(--primary-color), #bc35d9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .total-count {
      text-align: center;
      margin-bottom: 1.5rem;
      color: var(--text-color);
      opacity: 0.8;
    }

    .page-row {
      margin-bottom: 12px;
    }

    .page-link {
      display: block;
      padding: 16px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      text-decoration: none;
      color: var(--text-color);
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      background: var(--bg-color);
      cursor: pointer;
    }

    .page-link:hover {
      transform: translateY(-2px);
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .page-link::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background: var(--primary-color);
      transform: scaleY(0);
      transition: transform 0.2s ease;
    }

    .page-link:hover::before {
      transform: scaleY(1);
    }

    .page-link:active {
      transform: translateY(0);
      opacity: 0.8;
    }

    .file-name {
      font-weight: 500;
      color: var(--primary-color);
    }

    .path-separator {
      margin: 0 8px;
      color: var(--text-color);
      opacity: 0.5;
    }

    .full-path {
      opacity: 0.8;
    }

    @media (max-width: 640px) {
      body {
        padding: 16px;
      }

      h1 {
        font-size: 1.5rem;
      }

      .page-link {
        padding: 12px;
      }
    }
  </style>
</head>
<body>
  <h1>子项目app/{{subAppName}}页面列表</h1>
  <div id="app">
    <div class="total-count"></div>
  </div>
  <script>
    const pages = {{pages}};
    const app = document.getElementById('app');
    const totalCount = document.querySelector('.total-count');

    // 显示总数
    totalCount.textContent = \`共 \${pages.length} 个页面\`;

    // 排序页面
    pages.sort((a, b) => a.fileName.localeCompare(b.fileName));

    pages.forEach(page => { 
      const row = document.createElement('div');
      row.className = 'page-row';
      
      const link = document.createElement('a');
      link.href = page.fullPath;
      link.target = '_blank';
      link.className = 'page-link';
      
      const fileName = document.createElement('span');
      fileName.className = 'file-name';
      fileName.textContent = page.fileName;
      
      const separator = document.createElement('span');
      separator.className = 'path-separator';
      separator.textContent = '>>>>>';
      
      const fullPath = document.createElement('span');
      fullPath.className = 'full-path';
      fullPath.textContent = page.fullPath;
      
      link.appendChild(fileName);
      link.appendChild(separator);
      link.appendChild(fullPath);
      row.appendChild(link);
      app.appendChild(row);
    });
  </script>
</body>
</html>`;
}

// 获取所有页面路径
function getAllPages(dir, exclude, pathPrefix, pathSubAppName) {
  pathSubAppName = `/${ pathSubAppName}`;
  const pages = [];
  function scan(directory) {
    const files = fs.readdirSync(`${process.cwd() }/${ directory}`);
    
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = fs.statSync(fullPath);
      
      // 排除不需要的目录
      if (exclude.some(e => fullPath.includes(e))) {
        continue;
      }
      
      if (stat.isDirectory()) {
        scan(fullPath);
      } else {
        // 只收集 .vue, .jsx, .tsx 文件
        if (/\.(html)$/.test(file)) {
          const fileName = fullPath.
            replace(dir, '').
            replace(/\.(html)$/, '');
          pages.push({
            fileName: fileName.replace(/^\//, ''),
            fullPath: `${pathPrefix + pathSubAppName }/${ fullPath}`
          });
        }
      }
    }
  }
  
  scan(dir);
  return pages;
}



export default function pagesListPlugin(options = {}) {
  let registered = false;// 添加注册标记

  const {
    pagesDir = 'pages',
    exclude = ['components', 'utils', 'styles'],
    template,
    pathPrefix = '/monofe',
    pathSubAppName = 'personal'
  } = options;

  return {
    name: 'vite-plugin-pages-list',
    
    configureServer(server) {
      if (registered) return;// 如果已经注册过，直接返回
      registered = true;// 设置注册标记

      // 创建路由 /_pages 来展示页面列表
      server.middlewares.use('/_pages', async (req, res) => {
        const pages = getAllPages(pagesDir, exclude, pathPrefix, pathSubAppName);
        let html = template
          ? fs.readFileSync(template, 'utf-8')
          : getDefaultTemplate();

        html = html.replace('{{pages}}', JSON.stringify(pages));
        html = html.replace('{{subAppName}}', pathSubAppName);
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      });
    }
  };
}
