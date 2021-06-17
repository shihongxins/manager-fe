<template>
  <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
      <el-steps :active="dialogData.currentFlow">
        <el-step
          v-for="(flow, index) in dialogData.auditFlows"
          :key="index"
          :title="flow.userName"
          :description="getStepDesc(index)"
          :status="getStepStatus(index)"
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
        <span>{{ currentAuditUser?.userName }}</span>
      </el-form-item>
      <el-form-item label="备注:" prop="remark" v-if="dialogData.action==='audit'">
        <el-input
          type="textarea"
          v-model="dialogData.remark"
          placeholder="请输入备注信息"
          autocomplete="off" >
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer v-if="dialogData.action==='audit'">
      <el-button @click="handleToggleDialogShow(false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmitApplyLeave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {
  computed, getCurrentInstance, reactive, toRaw,
} from 'vue';

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getRoleList 重新加载页面表格数据的方法
 * @description 查看，审核休假申请的业务逻辑（弹窗）
 */
const useLeaveOperateEffect = (ctx, getLeaveList) => {
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    leaveType: 0,
    leaveDate: [],
    leaveLength: 0,
    reason: '',
    applyState: '',
    applyUser: {},
    auditFlows: [],
    currentFlow: 0,
    auditLogs: [],
    remark: '',
    // 下面是弹窗的属性数据
    showDialog: false, // true 展示, false 隐藏
    action: '', // view 查看, audit 审核
    title: '',
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    remark: { trigger: 'blur', required: true, message: '请输入审核备注' },
  };
  // 表单数据的描述对照(计算属性)
  const leaveTypeDesc = computed(
    () => ctx.leaveTypeList.filter(
      (item) => item.value === dialogData.leaveType,
    )[0]?.label,
  );
  const applyStateDesc = computed(
    () => ctx.applyStateList.filter(
      (item) => item.value === dialogData.applyState,
    )[0]?.label,
  );
  const currentAuditUser = computed(
    () => dialogData.auditFlows.filter(
      (item, index) => index === dialogData.currentFlow,
    )[0],
  );
  const getStepStatus = (flowIndex) => {
    // ['wait', 'process', 'finish', 'error', 'success'];
    let status = 'wait';
    if (dialogData.applyState > 3) {
      // 4 审批驳回， 5 撤销作废
      status = 'error';
    }
    if (dialogData.applyState === 3) {
      // 3 审批通过
      status = 'finish';
    }
    if (dialogData.applyState < 3) {
      // 1 待审批， 2 审批中
      if (flowIndex === dialogData.currentFlow) {
        status = 'process';
      }
      if (dialogData.auditLogs[flowIndex]) {
        status = 'success';
      }
    }
    return status;
  };
  const getStepDesc = (flowIndex) => {
    if (dialogData.auditLogs[flowIndex]
      && dialogData.auditLogs[flowIndex].userName === dialogData.auditFlows[flowIndex].userName) {
      const { action, remark } = dialogData.auditLogs[flowIndex];
      return `${action}: ${remark}`;
    }
    return applyStateDesc.value;
  };
  // 弹窗的显隐状态切换方法
  const handleToggleDialogShow = (show, action, leaveInfo) => {
    // action 必须为 查看或审核，才能显示表单
    if (action === 'view' || action === 'audit') {
      dialogData.action = action;
      dialogData.title = `${action === 'view' ? '查看' : '审核'}休假申请`;
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单
      ctx.$refs.operateForm.resetFields();
      if (show) {
        // 如果是打开编辑，重新填充默认值
        dialogData.leaveType = leaveInfo.leaveType;
        dialogData.leaveDate = leaveInfo.leaveDate;
        dialogData.leaveLength = leaveInfo.leaveLength;
        dialogData.reason = leaveInfo.reason;
        dialogData.applyState = leaveInfo.applyState;
        dialogData.applyUser = leaveInfo.applyUser;
        dialogData.auditFlows = leaveInfo.auditFlows;
        dialogData.currentFlow = leaveInfo.currentFlow;
        dialogData.auditLogs = leaveInfo.auditLogs;
        dialogData.remark = leaveInfo.remark;
      }
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitApplyLeave = () => {
    // 提交前 校验表单
    ctx.$refs.operateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const leaveInfo = toRaw(dialogData);
        const res = await ctx.$api.applyLeaveOperate(leaveInfo);
        if (res === true) {
          // 关闭弹窗
          handleToggleDialogShow(false);
          // 重新加载表格
          getLeaveList();
          // 弹出提示
          ctx.$message.success('提交审核休假申请成功！');
        } else {
          ctx.$message.warning('提交审核休假申请失败');
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
    currentAuditUser,
    getStepStatus,
    getStepDesc,
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
    const { ctx } = getCurrentInstance();
    return {
      ...useLeaveOperateEffect(ctx, props.getLeaveList),
    };
  },
};
</script>
