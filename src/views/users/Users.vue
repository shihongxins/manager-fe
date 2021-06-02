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
          <el-button type="primary" @click="handleQuerySubmit">查询</el-button>
          <el-button native-type="reset" @click="handleQuerySubmit"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <div class="table_actions">
        <el-button
          type="primary"
          @click="showDialog(true, 'add')"
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
                @click="showDialog(true, 'edit', scope.row)"
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
          @size-change="handleQuerySubmit"
          @current-change="handleQuerySubmit"
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
    <UserOperateDialog ref="userOperateDialog" :getUserList="getUserList" />
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import UserOperateDialog from './components/UserOperateDialog.vue';

/**
 * @param {Object} ctx 页面实例对象
 * @description 用户数据表格的初始化业务逻辑（包括查询与分页）
 */
const useUserTableInitEffect = (ctx) => {
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
  // 查询、重置查询数据方法
  const handleQuerySubmit = () => {
    pageData.pageNum = 1;
    getUserList();
  };
  // （调用子组件的方法）弹出用户编辑弹窗
  const showDialog = (show, action , userInfo) => {
    ctx.$refs.userOperateDialog.handleToggleShowUserDialog(show,action,userInfo)
  }
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getUserList();
  });
  return {
    tableColumns,
    userList,
    query,
    pageData,
    getUserList,
    handleQuerySubmit,
    showDialog
  };
};

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getUserList 重新加载页面表格数据的方法
 * @description 删除用户数据的业务逻辑
 */
const useUserDeleteEffect = (ctx, getUserList) => {
  // 选中的表格数据
  const userSelectedList = ref([]);
  const handleSelectionChange = (list) => {
    userSelectedList.value = list;
  };
  // 根据用户 Id 删除用户（数组，可删除多个）的具体方法
  const userDelete = async (userIds) => {
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
  // 用户单条数据删除
  const handleSingleDel = (row) => {
    if (row && row.userId) {
      userDelete([row.userId]);
    }
  };
  // 用户批量数据删除
  const handlePatchDel = () => {
    const userIds = [];
    userSelectedList.value.forEach((item) => {
      if (item && item.userId) {
        userIds.push(item.userId);
      }
    });
    userDelete(userIds);
  };

  // 返回业务逻辑给 setup
  return {
    handleSelectionChange,
    handleSingleDel,
    handlePatchDel,
  };
};

export default {
  name: "Users",
  components: {
    UserOperateDialog
  },
  setup() {
    // 获取页面实例，供其他逻辑使用
    const { ctx } = getCurrentInstance();
    // 调用 用户数据表格的初始化业务逻辑
    //（它需要先解构的原因是，另外两个业务逻辑也要用到它内部的 getUserList 而不能再产生另外的作用域）
    const {
      tableColumns,
      userList,
      query,
      pageData,
      getUserList,
      handleQuerySubmit,
      showDialog
    } = useUserTableInitEffect(ctx);
    return {
      tableColumns,
      userList,
      query,
      pageData,
      getUserList,
      handleQuerySubmit,
      showDialog,
      // 调用 删除用户数据的业务逻辑
      ...useUserDeleteEffect(ctx, getUserList),
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
