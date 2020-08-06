<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 添加角色按钮弹出框 -->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="35%"
      >
        <el-form
          label-width="80px"
          :model="addRoleForm"
          :rules="addRoleRules"
          ref="addRoleRef"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addSubmit">立即添加</el-button>
            <el-button @click="cancelAddRole">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300">
          <template scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-eidt"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteMessageBox(scope.row.id)"
              >删除</el-button
            >
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 编辑角色弹出框 -->
      <el-dialog
        title="编辑角色信息"
        :visible.sync="editRoleDialogVisible"
        width="35%"
      >
        <el-form
          label-width="80px"
          :model="editForm"
          :rules="addRoleRules"
          ref="editRoleRef"
        >
          <el-form-item label="角色ID">
            <el-input v-model="editForm.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="editSubmit">提交</el-button>
            <el-button @click="editRoleDialogVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      // 添加角色弹出框
      addRoleDialogVisible: false,
      // 编辑角色弹出框
      editRoleDialogVisible: false,
      // 添加用户角色表单信息
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 编辑角色表单信息
      editForm: {},
      // 添加角色规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [{ required: false }]
      },
      // 分配权限对话框
      setRightDialogVisible: false,
      rightsList: [],
      //   树形控件数据绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的权限Id
      defKeys: [],
      // 分配角色的roleId
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败!')
      }
      this.rolesList = res.data
    },
    cancelAddRole() {
      this.$refs.addRoleRef.resetFields()
      this.addRoleDialogVisible = false
    },
    // 提交添加角色
    async addSubmit() {
      const { data: res } = await this.$axios.post('roles', this.addRoleForm)
      if (res.meta.status !== 201) {
        return this.$message.error('添加角色失败!')
      }
      this.$message.success('添加角色成功')
      this.addRoleDialogVisible = false
      this.getRolesList()
    },
    // 编辑角色弹出框
    async showEditDialog(id) {
      this.editRoleDialogVisible = true
      const { data: res } = await this.$axios.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败!')
      }
      this.editForm = res.data
    },
    // 编辑角色表单提交
    async editSubmit() {
      const { data: res } = await this.$axios.put(
        `roles/${this.editForm.roleId}`,
        {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色信息失败!')
      }
      this.editRoleDialogVisible = false
      this.getRolesList()
    },
    // 删除角色
    deleteMessageBox(id) {
      this.$confirm('是否确定删除该角色', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$axios.delete('roles/' + id)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败!')
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getRolesList()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 根据Id删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('是否确定删除该权限', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除!')
      }
      const { data: res } = await this.$axios.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      this.$message.success('删除权限成功!')
      role.children = res.data
    },
    // 分配权限对话框
    async showSetRightDialog(role) {
      // 获取当前角色ID
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败!')
      }
      this.rightsList = res.data
      this.defKeys = []
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 递归获取角色下所有三级权限Id
    getLeafKeys(node, arr) {
      // 三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 非三级节点
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const {
        data: res
      } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.getRolesList()
      this.$message.success('分配权限成功')
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  margin-top: 15px;
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
}
</style>
