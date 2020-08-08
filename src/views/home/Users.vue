<template>
	<div>
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>
		<el-card class="box-card">
			<!-- 搜索栏 -->
			<div slot="header" class="clearfix">
				<el-row :gutter="20">
					<el-col :span="12">
						<el-input
							placeholder="请输入内容"
							v-model="queryInfo.query"
							clearable
							@clear="search"
						>
							<el-button
								slot="append"
								icon="el-icon-search"
								@click="search"
							></el-button>
						</el-input>
					</el-col>
					<el-col :span="6">
						<el-button type="primary" @click="addFormVisible = true"
							>添加用户</el-button
						>
					</el-col>
				</el-row>
			</div>
			<!-- 用户数据列表 -->
			<el-table :data="userlist" stripe style="width: 100%">
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column prop="username" label="用户名"> </el-table-column>
				<el-table-column prop="mobile" label="电话"></el-table-column>
				<el-table-column prop="email" label="邮箱"></el-table-column>
				<el-table-column prop="role_name" label="角色"></el-table-column>
				<el-table-column label="状态">
					<template scope="scope">
						<el-switch
							v-model="scope.row.mg_state"
							active-color="#13ce66"
							inactive-color="#ff4949"
							@change="userStateChanged(scope.row)"
						></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200">
					<template scope="scope">
						<!-- 修改按钮 -->
						<el-button
							type="primary"
							icon="el-icon-edit"
							size="mini"
							@click="showEditDialog(scope.row.id)"
						></el-button>
						<!-- 删除按钮 -->
						<el-button
							type="danger"
							icon="el-icon-delete"
							size="mini"
							@click="showDeleteMessage(scope.row.id)"
						></el-button>
						<!-- 分配角色按钮 -->
						<el-tooltip
							effect="dark"
							content="分配角色"
							placement="top"
							:enterable="false"
						>
							<el-button
								type="warning"
								icon="el-icon-setting"
								size="mini"
								@click="setRole(scope.row)"
							></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<!-- 分页功能 -->
			<el-pagination
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
				:current-page="queryInfo.pagenum"
				:page-sizes="[2, 4, 6, 8]"
				:page-size="queryInfo.pagesize"
				layout="total, sizes, prev, pager, next, jumper"
				:total="total"
			>
			</el-pagination>
		</el-card>
		<!-- 添加用户弹出框 -->
		<el-dialog
			title="添加用户"
			:visible.sync="addFormVisible"
			width="30%"
			@close="addDialogClosed"
		>
			<el-form
				ref="addFormRef"
				:model="addForm"
				:rules="addFormRules"
				label-width="70px"
				class="demo-ruleForm"
			>
				<el-form-item label="用户名" prop="username">
					<el-input v-model="addForm.username"></el-input>
				</el-form-item>
				<el-form-item label="密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="addForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="addForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="addFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 修改用户对话框 -->
		<el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
			<el-form
				ref="editFormRef"
				:model="editForm"
				:rules="addFormRules"
				label-width="70px"
				class="demo-ruleForm"
			>
				<el-form-item label="用户名">
					<el-input v-model="editForm.username" disabled></el-input>
				</el-form-item>
				<el-form-item label="邮箱" prop="email">
					<el-input v-model="editForm.email"></el-input>
				</el-form-item>
				<el-form-item label="手机" prop="mobile">
					<el-input v-model="editForm.mobile"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="editDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="eidtSubmit(editForm.id)"
					>提 交</el-button
				>
			</span>
		</el-dialog>

		<!-- 分配角色对话框 -->
		<el-dialog
			title="分配角色"
			:visible.sync="setRoleDialogVisible"
			width="50%"
		>
			<div>
				<p>当前用户：{{ userInfo.username }}</p>
				<p>当前角色：{{ userInfo.role_name }}</p>
				<p>
					分配角色：
					<el-select v-model="selectedRoleId" placeholder="请选择">
						<el-option
							v-for="item in rolesList"
							:key="item.id"
							:label="item.roleName"
							:value="item.id"
						></el-option>
					</el-select>
				</p>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="setRoleDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="saveRole">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
export default {
	data() {
		var emailValidate = (rule, value, callback) => {
			var reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/
			if (!reg.test(value)) {
				return callback(new Error('请输入格式正确的邮箱'))
			}
			callback()
		}
		var mobileValidate = (rule, value, callback) => {
			var reg = /^1[3456789]\d{9}$/
			if (!reg.test(value)) {
				return callback(new Error('请输入格式正确的手机号'))
			}
			callback()
		}
		return {
			queryInfo: {
				query: '',
				pagenum: 1,
				pagesize: 2
			},
			userlist: [],
			total: 0,
			addFormVisible: false,
			addForm: {
				username: '',
				password: '',
				email: '',
				mobile: ''
			},
			addFormRules: {
				username: [
					{ required: true, message: '请输入用户名', trigger: 'blur' },
					{ min: 3, max: 10, message: '用户名长度在3到10个字符' }
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' },
					{ min: 3, max: 10, message: '用户名长度在3到10个字符' }
				],
				email: [
					{ required: true, message: '请输入邮箱', trigger: 'blur' },
					{ validator: emailValidate, trigger: 'blur' }
				],
				mobile: [
					{ required: true, message: '请输入手机号', trigger: 'blur' },
					{ validator: mobileValidate, trigger: 'blur' }
				]
			},
			// 控制修改用户对话框
			editDialogVisible: false,
			editForm: {},
			// 分配角色对话框
			setRoleDialogVisible: false,
			// 需要被分配角色的用户信息
			userInfo: {},
			// 所有角色列表
			rolesList: [],
			// 选中的角色Id
			selectedRoleId: ''
		}
	},
	methods: {
		handleSizeChange(val) {
			this.queryInfo.pagesize = val
			this.getUsers()
		},
		handleCurrentChange(val) {
			this.queryInfo.pagenum = val
			this.getUsers()
		},
		async userStateChanged(userInfo) {
			const { data: res } = await this.$axios.put(
				`users/${userInfo.id}/state/${userInfo.mg_state}`
			)
			if (res.meta.status !== 200) {
				userInfo.mg_state = !userInfo.mg_state
				return this.$message.error('状态更新失败')
			}
			this.$message.success('状态更新成功')
		},
		async getUsers() {
			const { data: res } = await this.$axios.get('users', {
				params: this.queryInfo
			})
			if (res.meta.status !== 200) {
				return this.$message.error('数据获取失败')
			}
			this.userlist = res.data.users
			this.total = res.data.total
		},
		// 搜索按钮
		search() {
			this.queryInfo.pagenum = 1
			this.getUsers()
		},
		addDialogClosed() {
			this.$refs.addFormRef.resetFields()
		},
		addUser() {
			// addFormVisible = false
			this.$refs.addFormRef.validate(async valid => {
				if (!valid) {
					return
				}
				const { data: res } = await this.$axios.post('users', this.addForm)
				if (res.meta.status !== 201) {
					console.log(res)
					return this.$message.error('添加用户失败！')
				}
				this.$message.success('添加用户成功！')
				this.addFormVisible = false
				this.getUsers()
			})
		},
		// 展示编辑用户对话框
		async showEditDialog(id) {
			this.editDialogVisible = true
			const { data: res } = await this.$axios.get('users/' + id)
			if (res.meta.status !== 200) {
				return this.$message.error('获取用户信息失败')
			}
			this.editForm = res.data
		},
		// 修改用户提交
		async eidtSubmit(id) {
			const { data: res } = await this.$axios.put('users/' + id, this.editForm)
			if (res.meta.status !== 200) {
				return this.$message.error('修改用户失败！')
			}
			this.$message.success('修改用户成功！')
			this.editDialogVisible = false
			this.getUsers()
		},
		// 弹出删除MessageBox
		showDeleteMessage(id) {
			this.$confirm('是否确认删除此用户？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			})
				.then(async () => {
					const { data: res } = await this.$axios.delete('users/' + id)
					if (res.meta.status !== 200) {
						return this.$message.error('删除失败!')
					}
					this.$message({
						type: 'success',
						message: '删除成功！'
					})
					this.queryInfo.pagenum = 1
					this.getUsers()
				})
				.catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					})
				})
		},
		// 展示分配角色对话框
		async setRole(userInfo) {
			this.userInfo = userInfo

			// 获取所有角色列表
			const { data: res } = await this.$axios.get('roles')
			if (res.meta.status !== 200) {
				return this.$message.error('获取角色列表失败！')
			}
			this.rolesList = res.data
			console.log(this.rolesList)
			this.setRoleDialogVisible = true
		},
		// 分配新角色提交
		async saveRole() {
			if (!this.selectedRoleId) {
				return this.$message.error('请选择要分配的角色！')
			}
			const { data: res } = await this.$axios.put(
				`users/${this.userInfo.id}/role`,
				{
					rid: this.selectedRoleId
				}
			)
			if (res.meta.status !== 200) {
				return this.$message.error('更新角色失败！')
			}
			this.$message.success('更新角色成功！')
			this.getUsers()
			this.selectedRoleId = ''
			this.userInfo = ''
			this.setRoleDialogVisible = false
		}
	},
	mounted() {
		this.getUsers()
	}
}
</script>

<style lang="scss" scoped></style>
