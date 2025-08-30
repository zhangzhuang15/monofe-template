import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import { Dropdown, Space, Menu } from 'antd';
import './index.scss';

// 环境列表
const envList: Record<string, string> = {
  test: 'https://xxx.test.yyy.com/',
  staging: 'https://xxx.st.yyy.com/',
  production: 'https://xxx.yyy.com/'
};
// 环境映射
const envMap = {
  dev: '开发环境',
  test01: '测试环境',
  staging: '备机环境',
  production: '线上环境'
};

const items: MenuProps['items'] = [
  {
    label: '退出登录',
    key: '1',
  },
];

//从cookie中获取用户name
const getLoginName = () => {
  const loginName = document.cookie.split('; ').
    find(row => row.startsWith('loginName='));
  return loginName ? decodeURIComponent(loginName.split('=')[1]) : null;
};

const UserButton: React.FC = () => {
  const loginName = getLoginName();
  //@ts-ignore
  const [currentEnv] = useState<string>(window.__ENV || 'dev');

  const onClick: MenuProps['onClick'] = ({ key }) => {
    // 退出登录
    if (key === '1') {
      window.location.href = '/api/carrier/sso/logout4622';
    }
  };

  const handleEnvironmentChange = (env: string) => {
    const url = envList[env];
    if (url) {
      window.location.href = url;
    }
  };

  const environmentMenu = (
    <Menu onClick={({ key }) => handleEnvironmentChange(key)}>
      <Menu.Item key="test">切换至测试环境</Menu.Item>
      <Menu.Item key="staging">切换至备机环境</Menu.Item>
      <Menu.Item key="production">切换至线上环境</Menu.Item>
    </Menu>
  );

  return (
    <Space size="small">
      <Dropdown overlay={environmentMenu} arrow>
        <a onClick={(e) => e.preventDefault()} style={{ color: '#000' }}>
          <Space size="small">
            <span>当前环境：{envMap[currentEnv as keyof typeof envMap] || currentEnv}</span>
          </Space>
        </a>
      </Dropdown>
      <Dropdown overlay={<Menu items={items} onClick={onClick} />} arrow>
        <a onClick={(e) => e.preventDefault()} style={{ color: '#000' }}>
          <Space size="small">
            <span>欢迎：{loginName}</span>
          </Space>
        </a>
      </Dropdown>
    </Space>
  );
};

const Index: React.FC = () => (
  <>
    <div className='header-brand-container'>
      <a href='/' className='header-brand'>
        <h2 className='header-font'>管理系统</h2>
      </a>
    </div>
    <div className='header-menu-container'>
      <div className='header-menu-right-box'>
        <div className='header-menu-item-title'>
          <div className='header-item-container 
          hcp-popover__reference' style={{ paddingRight: '17px' }}
          >
            <UserButton />
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Index;