import React, { useState, useEffect } from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons';
import { Menu, type MenuProps } from 'antd';
import { getMenuList } from '../service/api';
import './index.scss';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  {
    key: '1',
    icon: <HomeOutlined />,
    label: 'Home'
  },
  {
    key: '2',
    icon: <AppstoreOutlined />,
    label: '目标管理',
    children: [
      { key: '21', label: 'Option 1' },
      { key: '22', label: 'Option 2' },
      {
        key: '23',
        label: 'Submenu',
        children: [
          { key: '231', label: 'Option 1' },
          { key: '232', label: 'Option 2' },
          { key: '233', label: 'Option 3' },
        ],
      },
    ],
  },
  {
    key: '3',
    icon: <SettingOutlined />,
    label: '运营管理',
    children: [
      { key: '31', label: 'Option 1' },
      { key: '32', label: 'Option 2' },
      { key: '33', label: 'Option 3' },
      { key: '34', label: 'Option 4' },
    ],
  },
];

interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(items as LevelKeysProps[]);

// 添加图标映射函数
const getMenuIcon = (iconName?: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'home': <HomeOutlined />,
    'mail': <MailOutlined />,
    'appstore': <AppstoreOutlined />,
    'setting': <SettingOutlined />,
  };
  return iconName ? iconMap[iconName] : null;
};

// 添加转换函数
const transformMenuData = (menus: any[]): MenuItem[] => menus.map(menu => {
  const menuItem: MenuItem = {
    key: menu.id?.toString() || '',
    label: menu.title,
    icon: getMenuIcon(menu.icon), // 根据icon字段返回对应的图标组件
  };

  if (menu.menus && menu.menus.length > 0) {
    const list = transformMenuData(menu.menus);
    if (list?.length > 0) {
      // @ts-ignore
      menuItem.children = list;
    }
  }

  // 如果有链接，将label转换为a标签
  if (menu.url) {
    menuItem.label = (
      <a href={menu.url} style={{ color: '#000' }} rel="noopener noreferrer">
        {menu.title}
      </a>
    );
  }

  return menuItem;
});


const Index: React.FC = () => {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [stateOpenKeys, setStateOpenKeys] = useState(['2', '23']);

  const onOpenChange: MenuProps['onOpenChange'] = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys.
        filter((key) => key !== currentOpenKey).
        findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys.
          // remove repeat key
          filter((_, index) => index !== repeatIndex).
          // remove current level all child
          filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  // 修改loadMenuList函数
  const loadMenuList = async () => {
    const res = await getMenuList();
    // @ts-ignore
    const {code, data} = res || {};
    if (code === 0) {
      const { menus } = data || {};
      const transformedMenus = transformMenuData(menus);
      setMenuList(transformedMenus);
    }
  };

  useEffect(() => {
    loadMenuList();
  }, []);

  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      scrollbarWidth: 'none', // Firefox
      msOverflowStyle: 'none', // IE and Edge
      '&::-webkit-scrollbar': { // Chrome, Safari, Opera
        display: 'none'
      }
    }}
    >
      <Menu
        theme='light'
        mode="inline"
        onOpenChange={onOpenChange}
        style={{ width: '100%', height: '100%', maxWidth: 400 }}
        items={menuList}
      />
    </div>
  );
};

export default Index;