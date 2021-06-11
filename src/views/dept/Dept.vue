<template>
  <div class="content_wrapper">
    <div class="query_form_wrapper">
      <el-form :inline="true" :model="query" ref="queryForm">
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="query.deptName"
            placeholder="请输入部门名称"
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
          :data="deptList"
          row-key="_id"
          stripe
        >
          <el-table-column
            v-for="col in tableColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :formatter="col.formatter"
            :width="col.width"
          ></el-table-column>
          <el-table-column label="操作" width="210px">
            <template #default="scope">
              <el-button
                size="mini"
                type="primary"
                @click="showDialog(true, 'add', scope.row)"
              >
                添加
              </el-button>
              <el-button
                size="mini"
                @click="showDialog(true, 'edit', scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleSingleDel(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <DeptOperateDialog ref="deptOperateDialog" :getDeptList="getDeptList" :deptList="deptList" />
  </div>
</template>

<script>
import {
  getCurrentInstance, onMounted, reactive, ref,
} from 'vue';
import utils from '@/utils/utils';
import DeptOperateDialog from './components/DeptOperateDialog.vue';

/**
 * @param {Object} ctx 页面实例对象
 * @description 部门数据表格的初始化业务逻辑（包括查询）
 */
const useDeptTableInitEffect = (ctx) => {
  // 表格展示列项
  const tableColumns = [
    {
      label: '部门名称',
      prop: 'deptName',
    },
    {
      label: '负责人',
      prop: 'userInfo',
      formatter: (row, column, userInfo) => ((userInfo && userInfo.userName) ? userInfo.userName : ''),
    },
    {
      label: '创建时间',
      prop: 'createTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
    },
    {
      label: '更新时间',
      prop: 'updateTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
    },
  ];
  // 表格数据
  const deptList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    deptName: '',
  });
  // 加载表格数据的方法
  const getDeptList = async () => {
    const params = { ...query };
    const list = await ctx.$api.getDeptList(params);
    if (list) {
      deptList.value = list;
    }
  };
  // 查询、重置查询数据方法
  const handleQuerySubmit = (options) => {
    const { reset } = options;
    if (reset) {
      ctx.$refs.queryForm.resetFields();
    }
    getDeptList();
  };
  // （调用子组件的方法）弹出部门编辑弹窗
  const showDialog = (show, action, deptInfo) => {
    ctx.$refs.deptOperateDialog.handleToggleDialogShow(show, action, deptInfo);
  };
  // 删除一项部门及其子部门
  const handleSingleDel = async (row) => {
    if (row && row._id) {
      const res = await ctx.$api.deptOperate({
        _id: row._id,
        deptName: row.deptName,
        action: 'delete',
      });
      if (res === true) {
        ctx.$message.success('删除成功！');
        getDeptList();
      } else {
        ctx.$message.error('删除失败！');
      }
    }
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getDeptList();
  });
  return {
    tableColumns,
    deptList,
    query,
    getDeptList,
    handleQuerySubmit,
    showDialog,
    handleSingleDel,
  };
};

export default {
  name: 'Dept',
  components: {
    DeptOperateDialog,
  },
  setup() {
    // 获取页面实例，供其他逻辑使用
    const { ctx } = getCurrentInstance();
    return {
      ...useDeptTableInitEffect(ctx),
    };
  },
};
</script>
