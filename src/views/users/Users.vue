<template>
  <div class="users">
    <div class="form_wrapper">
      <el-form :inline="true" :model="query">
        <el-form-item label="用户 ID">
          <el-input
            v-model="query.userId"
            placeholder="请输入用户 ID"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户名称">
          <el-input
            v-model="query.userName"
            placeholder="请输入用户名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="query.state" placeholder="请选择用户状态">
            <el-option label="所有" :value="0"></el-option>
            <el-option label="试用" :value="1"></el-option>
            <el-option label="在职" :value="2"></el-option>
            <el-option label="离职" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button native-type="reset" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <div class="table_actions">
        <el-button
          type="primary"
          @click="handleToggleShowUserDialog(true, 'add')"
          >新增</el-button
        >
        <el-button type="danger" @click="handlePatchDel">批量删除</el-button>
      </div>
      <div class="table_content">
        <el-table
          @selection-change="handleSelectionChange"
          :data="userList"
          stripe
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            v-for="col in tableColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :formatter="col.formatter"
          ></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="mini"
                @click="handleToggleShowUserDialog(true, 'edit', scope.row)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleSingleDel(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="table_pagination"
          @size-change="handleQuery"
          @current-change="handleQuery"
          v-model:current-page="pageData.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          v-model:page-size="pageData.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageData.total"
          background
        >
        </el-pagination>
      </div>
    </div>
    <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
      <el-form
        :model="dialogData"
        :rules="dialogDataRules"
        ref="userOperateForm"
        label-position="right"
        label-width="6em"
      >
        <el-form-item label="用户名称" prop="userName">
          <el-input
            v-model="dialogData.userName"
            :disabled="dialogData.action==='edit'"
            placeholder="请输入用户名称"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="dialogData.email"
            :disabled="dialogData.action==='edit'"
            placeholder="请输入用户邮箱"
            autocomplete="off"
          >
            <template #append>@manager.com</template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input
            v-model="dialogData.mobile"
            placeholder="请输入用户手机号"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="岗位名称" prop="job">
          <el-input
            v-model="dialogData.job"
            placeholder="请输入用户岗位名称"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="在职状态" prop="state">
          <el-select
            v-model="dialogData.state"
            placeholder="请选择用户在职状态"
          >
            <el-option label="试用期" :value="1"></el-option>
            <el-option label="在职" :value="2"></el-option>
            <el-option label="离职" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="系统角色" prop="roleList">
          <el-select
            v-model="dialogData.roleList"
            placeholder="请选择用户系统角色"
            style="width: 100%"
            multiple
          >
            <el-option
              v-for="role in roleList"
              :key="role._id"
              :label="role.roleName"
              :value="role._id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-cascader
            v-model="dialogData.deptId"
            :options="deptList"
            :props="{
              label: 'deptName',
              value: '_id',
              checkStrictly: true,
              expandTrigger: 'hover',
            }"
            placeholder="请选择用户所属部门"
            style="width: 100%"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleToggleShowUserDialog(false)">取 消</el-button>
        <el-button type="primary" @click="handleSubmitUserOperate">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from "vue";
// 表格初始化业务逻辑
const useInitTableEffect = () => {
  // 当前页面实例
  const { ctx } = getCurrentInstance();
  // 表格展示列项
  const tableColumns = [
    {
      label: "用户 ID",
      prop: "userId",
    },
    {
      label: "用户名称",
      prop: "userName",
    },
    {
      label: "用户邮箱",
      prop: "userEmail",
    },
    {
      label: "用户角色",
      prop: "role",
      formatter(row, column, value) {
        const dictionary = {
          0: "普通用户",
          1: "管理员",
        };
        return dictionary[value];
      },
    },
    {
      label: "用户状态",
      prop: "state",
      formatter(row, column, value) {
        const dictionary = {
          1: "试用",
          2: "在职",
          3: "离职",
        };
        return dictionary[value];
      },
    },
    {
      label: "注册时间",
      prop: "createTime",
    },
    {
      label: "最后登录时间",
      prop: "lastLoginTime",
    },
  ];
  // 表格数据
  const userList = ref([]);
  // 选中的表格数据
  const userSelectedList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    userId: "",
    userName: "",
    state: 0,
  });
  // 表格数据分页
  const pageData = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  // 加载表格数据的方法
  const getUserList = async () => {
    const params = { ...pageData, ...query };
    const { page, list } = await ctx.$api.getUserList(params);
    if (page && list) {
      userList.value = list;
      pageData.total = page.total;
    }
  };
  // 查询数据方法
  const handleQuery = () => {
    getUserList();
  };
  // 重置查询数据方法
  const handleReset = () => {
    pageData.pageNum = 1;
    getUserList();
  };
  const handleSelectionChange = (list) => {
    userSelectedList.value = list;
  };
  // 用户单条数据删除
  const handleSingleDel = async (row) => {
    if (row && row.userId) {
      const res = await ctx.$api.userDel({
        userIds: [row.userId],
      });
      if (res && res.nModified > 0) {
        ctx.$message.success("删除成功");
        getUserList();
      } else {
        ctx.$message.error("删除失败");
      }
    }
  };
  // 用户批量数据删除
  const handlePatchDel = async () => {
    const userIds = [];
    userSelectedList.value.forEach((item) => {
      if (item && item.userId) {
        userIds.push(item.userId);
      }
    });
    if (userIds.length > 0) {
      const res = await ctx.$api.userDel({
        userIds,
      });
      if (res && res.nModified > 0) {
        ctx.$message.success("删除成功！");
        getUserList();
      } else {
        ctx.$message.error("删除失败！");
      }
    } else {
      ctx.$message.warning("请先选中数据！");
    }
  };
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    userId: "",
    userName: "",
    email: "",
    mobile: "",
    job: "",
    state: 1,
    roleList: [],
    deptId: [],
    // 下面是弹窗的属性数据
    action: "add", // add: 新增, edit: 编辑
    title: "新增用户",
    showDialog: false, // true 展示, false 隐藏
  });
  const dialogDataRules = {
    userName: { trigger: "blur", required: true, message: "请输入用户名称" },
    email: { trigger: "blur", required: true, message: "请输入用户邮箱" },
    mobile: { trigger: "blur", pattern: /1[3-9]\d{9}/, message: "无效手机号" },
    deptId: { trigger: "blur", required: true, message: "请选择用户所属部门" },
  };
  const handleToggleShowUserDialog = (show, action, userInfo) => {
    // action 必须为新增或编辑，才能显示表单
    if (action === "add" || action === "edit") {
      dialogData.action = action;
      dialogData.title = (action === "add" ? "新增" : "编辑") + "用户";
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单
      ctx.$refs.userOperateForm.resetFields();
      if (show && action === "edit") {
        // 如果是打开编辑，重新填充默认值
        dialogData.userId = userInfo.userId;
        dialogData.userName = userInfo.userName;
        dialogData.email = userInfo.userEmail;
        dialogData.mobile = userInfo.mobile;
        dialogData.job = userInfo.job;
        dialogData.state = userInfo.state;
        dialogData.roleList = userInfo.roleList;
        dialogData.deptId = userInfo.deptId;
      }
    });
  };
  const roleList = ref([]);
  const deptList = ref([]);
  const getRoleList = async () => {
    const list = await ctx.$api.getRoleList();
    if (list.length) {
      roleList.value = list;
    }
  };
  const getDeptList = async () => {
    const list = await ctx.$api.getDeptList();
    if (list.length) {
      deptList.value = list;
    }
  };
  const handleSubmitUserOperate = () => {
    // 提交前 校验表单
    ctx.$refs.userOperateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const data = toRaw(dialogData);
        data.email += "@manager.com";
        const res = await ctx.$api.userOperate(data);
        if (res) {
          // 关闭弹窗
          handleToggleShowUserDialog(false);
          // 重新加载表格
          getUserList();
          // 弹出提示
          ctx.$message.success(dialogData.title + "成功！");
        } else {
          ctx.$message.warning(dialogData.title + "失败！");
        }
      }
    });
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getUserList();
    getRoleList();
    getDeptList();
  });
  return {
    tableColumns,
    userList,
    query,
    pageData,
    getUserList,
    handleQuery,
    handleReset,
    handleSingleDel,
    handleSelectionChange,
    handlePatchDel,
    dialogData,
    dialogDataRules,
    roleList,
    deptList,
    handleToggleShowUserDialog,
    handleSubmitUserOperate,
  };
};
export default {
  name: "Users",
  setup() {
    return {
      ...useInitTableEffect(),
    };
  },
};
</script>

<style lang="scss">
.users {
  height: 100%;
  display: flex;
  flex-flow: column;
}
</style>
