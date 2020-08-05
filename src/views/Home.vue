<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <i class="el-icon-menu"></i>
        <span>后台管理系统</span>
        <el-button type="info" @click="logout">退出</el-button>
      </div>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isToggle? '64px' : '200px'">
        <div class="toggle-button" @click="toggle">{{!isToggle?'&lt;&lt;' : '&gt;&gt;'}}</div>
        <el-menu
          :unique-opened="true"
          background-color="#344057"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isToggle" :collapse-transition='false' router
        >
          <!-- 一级菜单 -->
          <el-submenu
            v-for="item in menuList"
            :key="item.id"
            :index="item.id + ''"
          >
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="menuIcon[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="data in item.children"
              :key="data.id"
              :index="data.path" @click="print"
            >
              <template slot="title">
                <!-- 文本 -->
                <span>{{ data.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menuList: [],
      menuIcon: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isToggle: false
    }
  },
  created() {
    this.getMenuList()
  },
  watch: {
    '$route.path': function(news, old) {
      console.log(news)
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$axios.get('/menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
    // 折叠
    toggle() {
      this.isToggle = !this.isToggle
    },
    print() {
      console.log(this.$route.params)
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background: #242d41;
  color: #fff;
  line-height: 60px;
  overflow: hidden;
  i {
    font-size: 20px;
  }
  span {
    margin-left: 20px;
  }
  .el-button {
    float: right;
    margin-top: 10px;
  }
}
.el-aside {
  background-color: #344057;
  .el-menu{
    border: 0;
  }
  .el-submenu {
    i {
      margin-right: 20px;
      color: #fff;
    }
  }
  .toggle-button {
    background-color: #4a5062;
    color: #fff;
    text-align: center;
    cursor: pointer;
  }
}
.el-main {
  background-color: #fafafa;
}
</style>
