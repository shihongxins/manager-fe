<template>
  <div class="content_wrapper">
    <div class="query_form_wrapper">
      <el-form :inline="true" :model="query" ref="queryForm">
        <el-form-item label="申请状态" prop="applyState">
          <el-select v-model="query.applyState" placeholder="请选择">
            <el-option
              v-for="item in applyStateList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
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
        <el-button type="primary" @click="showApplyLeaveDialog(true, 'add')" v-has="'leave-add'">
          申请休假
        </el-button>
      </div>
      <div class="table_content">
        <el-table
          :data="leaveList"
          row-key="_id"
          stripe
        >
          <el-table-column
            v-for="col in tableColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :formatter="col.formatter"
            :class-name="col.className"
          ></el-table-column>
          <el-table-column label="操作" width="150px">
            <template #default="scope">
              <el-button
                size="mini"
                @click="showLeaveOperateDialog(true, 'view', scope.row)"
                v-has="'leave-view'"
              >
                查看
              </el-button>
              <el-button
                v-if="[1,2].indexOf(scope.row.applyState) > -1"
                size="mini"
                type="danger"
                @click="handleSingleDel(scope.row)"
                v-has="'leave-delete'"
              >
                作废
              </el-button>
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
    <ApplyLeaveDialog
      ref="applyLeaveDialog"
      :getLeaveList="getLeaveList"
      :leaveTypeList="leaveTypeList" />
    <LeaveOperateDialog
      ref="leaveOperateDialog"
      :getLeaveList="getLeaveList"
      :leaveTypeList="leaveTypeList"
      :applyStateList="applyStateList" />
  </div>
</template>

<script>
import {
  getCurrentInstance, onMounted, reactive, ref,
} from 'vue';
import utils from '@/utils/utils';
import ApplyLeaveDialog from './components/ApplyLeaveDialog.vue';
import LeaveOperateDialog from './components/LeaveOperateDialog.vue';

/**
 * @param {Object} ctx 页面实例对象
 * @description 休假数据表格的初始化业务逻辑（包括查询）
 */
const useLeaveTableInitEffect = (ctx) => {
  // 表格展示列项
  const tableColumns = [
    {
      label: '申请单号',
      prop: 'applyNO',
      width: 120,
    },
    {
      label: '休假类型',
      prop: 'leaveType',
      width: 70,
      formatter(row, column, value) {
        // eslint-disable-next-line no-use-before-define
        return leaveTypeList.filter((i) => i.value === value)[0]?.label;
      },
    },
    {
      label: '休假时间',
      prop: 'leaveDate',
      width: 150,
      formatter(row, column, value) {
        return value.join('至 ');
      },
    },
    {
      label: '休假时长',
      prop: 'leaveLength',
      width: 90,
      formatter(row, column, value) {
        return `${value} 天`;
      },
    },
    {
      label: '休假原因',
      prop: 'reason',
      className: 'leave-reason',
    },
    {
      label: '申请时间',
      prop: 'createTime',
      width: 90,
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
    },
    {
      label: '审批流程',
      prop: 'auditFlows',
      formatter(row, column, value) {
        return value.map((flow) => flow.userName).join(' -> ');
      },
    },
    {
      label: '当前进度',
      prop: 'currentFlow',
      width: 70,
      formatter(row, column, value) {
        return row?.auditFlows[value]?.userName;
      },
    },
    {
      label: '申请状态',
      prop: 'applyState',
      width: 70,
      formatter(row, column, value) {
        // eslint-disable-next-line no-use-before-define
        return applyStateList.filter((s) => s.value === value)[0].label;
      },
    },
  ];
  // 申请类别
  const leaveTypeList = reactive([
    { label: '事假', value: 1 },
    { label: '调休', value: 2 },
    { label: '年假', value: 3 },
  ]);
  // 申请状态
  const applyStateList = reactive([
    { label: '全部', value: 0 },
    { label: '待审批', value: 1 },
    { label: '审批中', value: 2 },
    { label: '审批通过', value: 3 },
    { label: '审批驳回', value: 4 },
    { label: '撤销作废', value: 5 },
  ]);
  // 表格数据
  const leaveList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    applyState: 0,
  });
  // 表格数据分页
  const pageData = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });
  // 加载表格数据的方法
  const getLeaveList = async () => {
    const params = { ...pageData, ...query };
    const { page, list } = await ctx.$api.getLeaveList(params);
    if (page && list) {
      leaveList.value = list;
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
    getLeaveList();
  };
  // （调用子组件的方法）弹出新增申请休假
  const showApplyLeaveDialog = (show) => {
    ctx.$refs.applyLeaveDialog.handleToggleDialogShow(show);
  };
  // （调用子组件的方法）弹出查看、审核申请休假详情弹窗
  const showLeaveOperateDialog = (show, action, leaveInfo) => {
    ctx.$refs.leaveOperateDialog.handleToggleDialogShow(show, action, leaveInfo);
  };
  // 删除一项休假及其子休假
  const handleSingleDel = async (row) => {
    if (row && row._id) {
      const res = await ctx.$api.applyLeaveOperate({
        _id: row._id,
        action: 'delete',
        title: '撤销并作废休假申请',
      });
      if (res === true) {
        ctx.$message.success('作废撤销成功！');
        getLeaveList();
      } else {
        ctx.$message.error('作废撤销失败！');
      }
    }
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getLeaveList();
  });
  return {
    tableColumns,
    leaveTypeList,
    applyStateList,
    leaveList,
    query,
    pageData,
    getLeaveList,
    handleQuerySubmit,
    showApplyLeaveDialog,
    showLeaveOperateDialog,
    handleSingleDel,
  };
};

export default {
  name: 'Leave',
  components: {
    ApplyLeaveDialog,
    LeaveOperateDialog,
  },
  setup() {
    const { ctx } = getCurrentInstance();
    return {
      ...useLeaveTableInitEffect(ctx),
    };
  },
};
</script>

<style lang="scss">
.leave-reason > .cell {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
