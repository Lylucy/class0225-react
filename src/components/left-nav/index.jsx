import React, { Component } from 'react';
import { Icon, Menu } from "antd";
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import menuList from '../../config/menu-config';

import './index.less';
import logo from '../../assets/images/logo.png';

const { SubMenu, Item } = Menu;

class LeftNav extends Component {
  static propTypes = {
    collapsed: PropTypes.bool.isRequired
  };

  createMenu = (menu) => {
    return <Item key={menu.key}>
      <Link to={menu.key}>
        <Icon type={menu.icon} />
        <span>{menu.title}</span>
      </Link>
    </Item>
  };

  // render 之前只做一次
  componentWillMount() {
    const { pathname } = this.props.location;
    // 根据menuList生成菜单
    this.menus = menuList.map((menu) => {
      // 判断是一级菜单还是二级菜单
      const children = menu.children;

      if (children) {
        // 二级菜单
        return <SubMenu
          key={menu.key}
          title={
            <span>
              <Icon type={menu.icon} />
              <span>{menu.title}</span>
            </span>
          }
        >
          {
            children.map((item) => {
              if (item.key === pathname) {
                // 说明当前地址是一个二级菜单，需要展开一级菜单
                // 初始化展开的菜单
                this.openKey = menu.key;
              }
              return this.createMenu(item);
            })
          }
        </SubMenu>;
      } else {
        // 一级菜单
        return this.createMenu(menu);
      }
    });
    // 初始化选中菜单
    this.selectedKey = pathname;
  }

  render() {
    const { collapsed } = this.props;

    return <div>
      <Link className="left-nav-logo" to='/home'>
        <img src={logo} alt="logo"/>
        <h1 style={{display: collapsed ? 'none' : 'block'}}>硅谷后台</h1>
      </Link>
      <Menu theme="dark" defaultSelectedKeys={[this.selectedKey]} defaultOpenKeys={[this.openKey]} mode="inline">
        {
          this.menus
        }
      </Menu>
    </div>;
  }
}

// withRouter是一个高阶组件，向非路由组件传递三大属性：history、location、match
export default withRouter(LeftNav);