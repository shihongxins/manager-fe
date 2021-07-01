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
                v-if="editable(scope.row)"
                type="primary"
                size="mini"
                @click="showAuditLeaveDialog(true, 'edit', scope.row)"
                v-has="'leave-edit'"
              >
                审核
              </el-button>
              <el-button
                v-else
                size="mini"
                @click="showAuditLeaveDialog(true, 'view', scope.row)"
              >
                查看
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
    <AuditLeaveDialog
      ref="auditLeaveDialog"
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
import AuditLeaveDialog from './components/AuditLeaveDialog.vue';

/**
 * @param {Object} ctx 页面实例对象
 * @description 休假数据表格的初始化业务逻辑（包括查询）
 */
const useAuditTableInitEffect = (ctx) => {
  // 表格展示列项
  const tableColumns = [
    {
      label: '申请单号',
      prop: 'applyNO',
      width: 120,
    },
    {
      label: '申请人',
      prop: 'applyUser',
      formatter(row, column, value) {
        return value.userName;
      },
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
      label: '审批流程',
      prop: 'auditFlows',
      formatter(row, column, value) {
        return value.map((flow) => flow.userName).join(' -> ');
      },
    },
    {
      label: '当前进度',
      prop: 'currentFlowUser',
      width: 70,
      formatter(row, column, value) {
        return value.userName;
      },
    },
    {
      label: '审批状态',
      prop: 'applyState',
      width: 70,
      formatter(row, column, value) {
        // eslint-disable-next-line no-use-before-define
        return applyStateList.filter((s) => s.value === value)[0]?.label;
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
    applyState: 1,
    type: 'audit',
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
  // （调用子组件的方法）弹出查看、审核申请休假详情弹窗
  const showAuditLeaveDialog = (show, action, leaveInfo) => {
    ctx.$refs.auditLeaveDialog.handleToggleDialogShow(show, action, leaveInfo);
  };
  // “审核” 按钮是否显示
  const editable = (row) => (row
    && [1, 2].indexOf(row.applyState) > -1
    && row.currentFlowUser?.userId === ctx.$store.state.userInfo?.userId);
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
    showAuditLeaveDialog,
    editable,
  };
};

export default {
  name: 'Audit',
  components: {
    AuditLeaveDialog,
  },
  setup() {
    const { ctx } = getCurrentInstance();
    return {
      ...useAuditTableInitEffect(ctx),
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
