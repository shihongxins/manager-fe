<template>
  <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
    <el-steps :active="dialogData.currentFlow">
      <el-step
        v-for="(flow, index) in dialogData.auditFlows"
        :key="index"
        :title="flow.userName"
        :status="getStepInfo(index).status"
        :description="getStepInfo(index).desc"
      ></el-step>
    </el-steps>
    <el-form
      :model="dialogData"
      :rules="dialogDataRules"
      ref="operateForm"
      label-position="right"
      label-width="6em"
    >
      <el-form-item label="申请人:">
        <span>{{ dialogData.applyUser.userName }}</span>
      </el-form-item>
      <el-form-item label="休假类型:" prop="leaveType">
        <span>{{ leaveTypeDesc }}</span>
      </el-form-item>
      <el-form-item label="休假时间:" prop="leaveDate">
        <span>{{ dialogData.leaveDate.join(' 至 ') }}</span>
      </el-form-item>
      <el-form-item label="休假时长:" prop="leaveLength">
        <span>{{ dialogData.leaveLength }} 天</span>
      </el-form-item>
      <el-form-item label="休假原因:" prop="reason">
        <span>{{ dialogData.reason }}</span>
      </el-form-item>
      <el-form-item label="审批状态:" prop="auditFlows">
        <span>{{ applyStateDesc }}</span>
      </el-form-item>
      <el-form-item label="审核人:">
        <span>{{ dialogData.currentFlowUser.userName }}</span>
      </el-form-item>
      <el-form-item label="备注:" prop="remark" v-if="dialogData.action==='edit'">
        <el-input
          type="textarea"
          v-model="dialogData.remark"
          placeholder="请输入备注信息"
          autocomplete="off" >
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer v-if="dialogData.action==='edit'">
      <el-button type="danger" @click="handleSubmitApplyLeave('reject')">驳 回</el-button>
      <el-button type="primary" @click="handleSubmitApplyLeave('approve')">批 准</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {
  computed, getCurrentInstance, reactive, toRaw, inject,
} from 'vue';

/**
 * @param {Object} proxy 页面实例对象
 * @param {Function} getRoleList 重新加载页面表格数据的方法
 * @description 查看，审核休假申请的业务逻辑（弹窗）
 */
const useLeaveOperateEffect = (proxy, getLeaveList) => {
  // 依赖注入 $api
  const $api = inject('$api');
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    _id: '',
    leaveType: 0,
    leaveDate: [],
    leaveLength: 0,
    reason: '',
    applyState: '',
    applyUser: {},
    auditFlows: [],
    currentFlow: 0,
    currentFlowUser: {},
    auditLogs: [],
    remark: '',
    // 下面是弹窗的属性数据
    showDialog: false, // true 展示, false 隐藏
    action: '', // view 查看, edit 审核
    title: '',
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    remark: { trigger: 'blur', required: true, message: '请输入审核备注' },
  };
  // 表单数据的描述对照(计算属性)
  const leaveTypeDesc = computed(
    () => proxy.leaveTypeList.filter(
      (item) => item.value === dialogData.leaveType,
    )[0]?.label,
  );
  const applyStateDesc = computed(
    () => proxy.applyStateList.filter(
      (item) => item.value === dialogData.applyState,
    )[0]?.label,
  );
  const getStepInfo = (flowIndex) => {
    const stepInfo = {
      // 状态 ['wait', 'process', 'finish', 'error', 'success'];
      status: 'wait',
      // 描述
      desc: applyStateDesc.value,
    };
    const log = dialogData.auditLogs.filter(
      (item) => (item.userId === dialogData.auditFlows[flowIndex].userId),
    );
    if (log.length > 0) {
      stepInfo.desc = log[0].remark;
      stepInfo.status = log[0].action === 'reject' ? 'error' : 'success';
    } else {
      if (dialogData.applyState < 3) {
        // 1 待审批， 2 审批中
        if (flowIndex === dialogData.currentFlow) {
          stepInfo.status = 'process';
        }
      }
      if (dialogData.applyState > 3) {
        // 4 审批驳回， 5 撤销作废
        stepInfo.status = 'error';
      }
    }
    if (dialogData.applyState === 3) {
      // 3 审批通过
      stepInfo.status = 'finish';
    }
    return stepInfo;
  };
  // 弹窗的显隐状态切换方法
  const handleToggleDialogShow = (show, action, leaveInfo) => {
    // action 必须为 查看或审核，才能显示表单
    if (action === 'view' || action === 'edit') {
      dialogData.action = action;
      dialogData.title = `${action === 'view' ? '查看' : '审核'}休假申请`;
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    proxy.$nextTick(() => {
      // 清空弹窗的表单
      proxy.$refs.operateForm.resetFields();
      if (show) {
        // 如果是打开编辑，重新填充默认值
        dialogData._id = leaveInfo._id;
        dialogData.leaveType = leaveInfo.leaveType;
        dialogData.leaveDate = leaveInfo.leaveDate;
        dialogData.leaveLength = leaveInfo.leaveLength;
        dialogData.reason = leaveInfo.reason;
        dialogData.applyState = leaveInfo.applyState;
        dialogData.applyUser = leaveInfo.applyUser;
        dialogData.auditFlows = leaveInfo.auditFlows;
        dialogData.currentFlow = leaveInfo.currentFlow;
        dialogData.currentFlowUser = leaveInfo.currentFlowUser;
        dialogData.auditLogs = leaveInfo.auditLogs;
        dialogData.remark = leaveInfo.remark;
      }
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitApplyLeave = (auditAction) => {
    // 提交前 校验表单
    proxy.$refs.operateForm.validate(async (valid) => {
      if (valid && auditAction) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const { _id, remark } = toRaw(dialogData);
        const res = await $api.leaveAudit({ _id, remark, action: auditAction });
        if (res === true) {
          // 关闭弹窗
          handleToggleDialogShow(false);
          // 重新加载表格
          getLeaveList();
          // 弹出提示
          proxy.$message.success('提交审核 成功！');
          // 刷新通知提示徽章
          $api.getNoticeCount();
        } else {
          proxy.$message.warning('提交审核 失败！');
        }
      }
    });
  };
  // 返回业务逻辑给 setup
  return {
    dialogData,
    dialogDataRules,
    leaveTypeDesc,
    applyStateDesc,
    getStepInfo,
    handleToggleDialogShow,
    handleSubmitApplyLeave,
  };
};

export default {
  name: 'LeaveOperateDialog',
  props: {
    getLeaveList: {
      required: true,
      type: Function,
    },
    leaveTypeList: {
      required: true,
      type: Array,
    },
    applyStateList: {
      required: true,
      type: Array,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    return {
      ...useLeaveOperateEffect(proxy, props.getLeaveList),
    };
  },
};
</script>
