import { defineConfig } from 'umi';;
import defaultSettings from './defaultSettings'; // https://umijs.org/config/



export const apiEndpoint = 'http://localhost:3000';

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  routes: [
    {
      path: '/articles/edit/:id',
      name: 'article-edit',
      authority: ['admin', 'user'],
      icon: 'read',
      hideInMenu: true,
      component: './ArticleEdit/ArticleEdit',
    },
    {
      path: '/articles/new',
      name: 'article-new',
      authority: ['admin', 'user'],
      icon: 'read',
      hideInMenu: true,
      component: './ArticleEdit/ArticleEdit',
    },
    {
      path: '/paste',
      name: 'paste',
      authority: ['admin', 'user'],
      icon: 'read',
      hideInMenu: true,
      component: './Paste/Paste',
    },
    {
      path: '/demo',
      name: 'demo',
      authority: ['admin', 'user'],
      icon: 'read',
      hideInMenu: true,
      component: './Demo/Demo',
    },
    {
      path: '/',
      component: '../layouts/BasicLayout',
      Routes: ['src/pages/Authorized'],
      authority: ['admin', 'user'],
      routes: [
        // {
        //   path: '/',
        //   name: 'welcome',
        //   icon: 'smile',
        //   component: './Welcome',
        // },
        {
          path: '/',
          redirect: '/platforms',
        },
        {
          path: '/platforms',
          name: 'platforms',
          icon: 'cloud',
          component: './PlatformList/PlatformList',
        },
        {
          path: '/articles',
          name: 'articles',
          icon: 'read',
          component: './ArticleList/ArticleList',
        },
        {
          path: '/helper',
          name: 'helper',
          icon: 'key',
          component: './Helper/Helper',
        },
        {
          path: '/environments',
          name: 'environments',
          icon: 'setting',
          component: './Environment/EnvironmentList',
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },

  ignoreMomentLocale: true,
  esbuild: {},
  manifest: {
    basePath: '/',
  },
});
