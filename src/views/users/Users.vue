<template>
  <div class="content_wrapper">
    <div class="query_form_wrapper">
      <el-form :inline="true" :model="query" ref="queryForm">
        <el-form-item label="用户 ID" prop="userId">
          <el-input
            v-model="query.userId"
            placeholder="请输入用户 ID"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input
            v-model="query.userName"
            placeholder="请输入用户名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="用户状态" prop="state">
          <el-select v-model="query.state" placeholder="请选择用户状态">
            <el-option label="所有" :value="0"></el-option>
            <el-option label="试用" :value="1"></el-option>
            <el-option label="在职" :value="2"></el-option>
            <el-option label="离职" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuerySubmit">查询</el-button>
          <el-button @click="handleQuerySubmit({reset: true})">重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <div class="table_tools">
        <el-button
          type="primary"
          @click="showDialog(true, 'add')"
          v-has="'user-add'"
          >新增</el-button
        >
        <el-button type="danger" @click="handlePatchDel" v-has="'user-patchDel'">批量删除</el-button>
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
            :width="col.width"
            :formatter="col.formatter"
          ></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="mini"
                @click="showDialog(true, 'edit', scope.row)"
                v-has="'user-edit'"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleSingleDel(scope.row)"
                v-if="scope.row.role != 1"
                v-has="'user-singleDel'"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="(pageSize) => { handleQuerySubmit({ pageSize }) }"
          @current-change="(pageNum) => { handleQuerySubmit({ pageNum }) }"
          v-model:current-page="pageData.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          v-model:page-size="pageData.pageSize"
          :total="pageData.total"
          class="table_pagination"
          layout="total, sizes, prev, pager, next, jumper"
          background
        >
        </el-pagination>
      </div>
    </div>
    <UserOperateDialog ref="userOperateDialog" :getUserList="getUserList" />
  </div>
</template>

<script>
import {
  getCurrentInstance, onMounted, reactive, ref, inject,
} from 'vue';
import utils from '@/utils/utils';
import UserOperateDialog from './components/UserOperateDialog.vue';

/**
 * @param {Object} proxy 页面实例对象
 * @description 用户数据表格的初始化业务逻辑（包括查询与分页）
 */
const useUserTableInitEffect = (proxy) => {
  // 依赖注入 $api
  const $api = inject('$api');
  // 表格展示列项
  const tableColumns = [
    {
      label: '用户 ID',
      prop: 'userId',
      width: 80,
    },
    {
      label: '用户名称',
      prop: 'userName',
    },
    {
      label: '用户邮箱',
      prop: 'userEmail',
      width: 200,
    },
    {
      label: '用户角色',
      prop: 'role',
      formatter(row, column, value) {
        const dictionary = {
          0: '普通用户',
          1: '管理员',
        };
        return dictionary[value];
      },
    },
    {
      label: '用户状态',
      prop: 'state',
      formatter(row, column, value) {
        const dictionary = {
          1: '试用',
          2: '在职',
          3: '离职',
        };
        return dictionary[value];
      },
    },
    {
      label: '注册时间',
      prop: 'createTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
      width: 90,
    },
    {
      label: '最后登录',
      prop: 'lastLoginTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
      width: 90,
    },
  ];
  // 表格数据
  const userList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    userId: '',
    userName: '',
    state: 2,
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
    const { page, list } = await $api.getUserList(params);
    if (page && list) {
      userList.value = list;
      pageData.total = page.total;
    }
  };
  // 查询、重置查询数据方法
  const handleQuerySubmit = (options) => {
    const { reset, pageNum, pageSize } = options;
    if (reset) {
      proxy.$refs.queryForm.resetFields();
    }
    pageData.pageNum = pageNum || 1;
    pageData.pageSize = pageSize || 10;
    getUserList();
  };
  // （调用子组件的方法）弹出用户编辑弹窗
  const showDialog = (show, action, userInfo) => {
    proxy.$refs.userOperateDialog.handleToggleDialogShow(show, action, userInfo);
  };
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
    showDialog,
  };
};

/**
 * @param {Object} proxy 页面实例对象
 * @param {Function} getUserList 重新加载页面表格数据的方法
 * @description 删除用户数据的业务逻辑
 */
const useUserDeleteEffect = (proxy, getUserList) => {
  // 依赖注入 $api
  const $api = inject('$api');
  // 选中的表格数据
  const userSelectedList = ref([]);
  const handleSelectionChange = (list) => {
    userSelectedList.value = list;
  };
  // 根据用户 Id 删除用户（数组，可删除多个）的具体方法
  const userDelete = async (userIds) => {
    if (userIds.length > 0) {
      const delCount = await $api.userDel({
        userIds,
      });
      if (delCount > 0) {
        proxy.$message.success('删除成功！');
        getUserList();
      } else {
        proxy.$message.error('删除失败！');
      }
    } else {
      proxy.$message.warning('请先选中数据！');
    }
  };
  // 用户单条数据删除
  const handleSingleDel = (row) => {
    if (row && row._id) {
      userDelete([row.userId]);
    }
  };
  // 用户批量数据删除
  const handlePatchDel = () => {
    const userIds = [];
    userSelectedList.value.forEach((item) => {
      if (item && item._id) {
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
  name: 'Users',
  components: {
    UserOperateDialog,
  },
  setup() {
    // 获取页面实例，供其他逻辑使用
    // [Vue3 getCurrentInstance 访问组件实例上下文，需使用 proxy 而非 ctx](https://www.jianshu.com/p/5558cadd10b9)
    // const { ctx } = getCurrentInstance();
    const { proxy } = getCurrentInstance();
    // 调用 用户数据表格的初始化业务逻辑
    // （它需要先解构的原因是，另外两个业务逻辑也要用到它内部的 getUserList 而不能再产生另外的作用域）
    const {
      tableColumns,
      userList,
      query,
      pageData,
      getUserList,
      handleQuerySubmit,
      showDialog,
    } = useUserTableInitEffect(proxy);
    return {
      tableColumns,
      userList,
      query,
      pageData,
      getUserList,
      handleQuerySubmit,
      showDialog,
      // 调用 删除用户数据的业务逻辑
      ...useUserDeleteEffect(proxy, getUserList),
    };
  },
};
</script>
