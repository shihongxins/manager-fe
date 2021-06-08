<template>
  <div class="content_wrapper">
    <div class="query_form_wrapper">
      <el-form :inline="true" :model="query" ref="queryForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="query.roleName"
            placeholder="请输入角色名称"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuerySubmit">查询</el-button>
          <el-button @click="handleQuerySubmit({ reset: true })">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <div class="table_tools">
        <el-button type="primary" @click="showDialog(true, 'add')">
          新增
        </el-button>
      </div>
      <div class="table_content">
        <el-table
          :data="roleList"
          stripe
        >
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
                type="primary"
                @click="showDialog(true, 'setPermission', scope.row)"
                >设置权限</el-button
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
    <RoleOperateDialog ref="roleOperateDialog" :getRoleList="getRoleList" />
  </div>
</template>

<script>
import {
  getCurrentInstance, onMounted, reactive, ref,
} from 'vue';
import utils from '@/utils/utils';
import RoleOperateDialog from './components/RoleOperateDialog.vue';

/**
 * @param {Object} ctx 页面实例对象
 * @description 菜单数据表格的初始化业务逻辑（包括查询）
 */
const useRoleTableInitEffect = (ctx) => {
  // 表格展示列项
  const tableColumns = [
    {
      label: '角色名称',
      prop: 'roleName',
    },
    {
      label: '备注',
      prop: 'remark',
    },
    {
      label: '权限列表',
      prop: 'menuList',
    },
    {
      label: '创建时间',
      prop: 'createTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
      width: '90px',
    },
  ];
  // 表格数据
  const roleList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    roleName: '',
  });
  // 表格数据分页
  const pageData = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  // 加载表格数据的方法
  const getRoleList = async () => {
    const params = { ...pageData, ...query };
    const { page, list } = await ctx.$api.getRoleList(params);
    if (page && list) {
      roleList.value = list;
      pageData.total = page.total;
    }
  };
  // 查询、重置查询数据方法
  const handleQuerySubmit = (options) => {
    const { reset, pageNum, pageSize } = options;
    if (reset) {
      ctx.$refs.queryForm.resetFields();
    }
    pageData.pageNum = pageNum || 1;
    pageData.pageSize = pageSize || 10;
    getRoleList();
  };
  // （调用子组件的方法）弹出编辑弹窗
  const showDialog = (show, action, roleInfo) => {
    ctx.$refs.roleOperateDialog.handleToggleDialogShow(show, action, roleInfo);
  };
  // 删除一项
  const handleSingleDel = async (row) => {
    if (row && row._id) {
      const res = await ctx.$api.roleOperate({
        _id: row._id,
        action: 'delete',
      });
      if (res) {
        ctx.$message.success('删除成功！');
        getRoleList();
      } else {
        ctx.$message.error('删除失败！');
      }
    }
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getRoleList();
  });
  return {
    tableColumns,
    roleList,
    query,
    pageData,
    getRoleList,
    handleQuerySubmit,
    showDialog,
    handleSingleDel,
  };
};

export default {
  name: 'Role',
  components: {
    RoleOperateDialog,
  },
  setup() {
    // 获取页面实例，供其他逻辑使用
    const { ctx } = getCurrentInstance();
    return {
      ...useRoleTableInitEffect(ctx),
    };
  },
};
</script>
