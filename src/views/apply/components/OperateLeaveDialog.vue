<template>
  <el-dialog v-model="dialogData.showDialog" title="新增申请休假">
    <el-form
      :model="dialogData"
      :rules="dialogDataRules"
      ref="operateForm"
      label-position="right"
      label-width="6em"
    >
      <el-form-item label="休假类型" prop="leaveType">
        <el-select v-model="dialogData.leaveType" placeholder="请选择休假类型">
          <el-option
          v-for="type in leaveTypeList"
          :key="type.value"
          :value="type.value"
          :label="type.label"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="休假时间" prop="leaveDate">
        <el-date-picker
          size="mini"
          v-model="dialogData.leaveDate"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date(2000, 1, 1, 9, 0, 0),new Date(2000, 1, 1, 17, 0, 0)]"
          @change="calculateLeaveLength"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="休假时长" prop="leaveLength">
        <el-input
          v-model="dialogData.leaveLength"
          placeholder="请确认休假时长"
          autocomplete="off"
        >
          <template #append>天</template>
        </el-input>
      </el-form-item>
      <el-form-item label="休假原因" prop="reason">
        <el-input
          type="textarea"
          v-model="dialogData.reason"
          placeholder="请输入休假原因"
          autocomplete="off"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleToggleDialogShow(false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmitApplyLeave">确 定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { getCurrentInstance, reactive, toRaw } from 'vue';
import utils from '@/utils/utils';

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getRoleList 重新加载页面表格数据的方法
 * @description 新增申请休假的业务逻辑（弹窗）
 */
const useApplyLeaveEffect = (ctx, getLeaveList) => {
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    leaveType: '',
    leaveDate: [],
    leaveLength: 0,
    reason: '',
    // 下面是弹窗的属性数据
    showDialog: false, // true 展示, false 隐藏
    action: 'add',
    title: '提价申请休假',
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    leaveType: { trigger: 'blur', required: true, message: '请选择休假类型' },
    leaveDate: { trigger: 'blur', required: true, message: '请选择休假日期' },
    leaveLength: { trigger: 'blur', required: true, message: '请确认休假时长' },
    reason: { trigger: 'blur', required: true, message: '请输入休假原因' },
  };

  // 计算休假时长
  const calculateLeaveLength = () => {
    let length = 0;
    try {
      length = ((dialogData.leaveDate[1] || 0) - (dialogData.leaveDate[0] || 0));
      if (length) {
        length /= (1000 * 60 * 60 * 24);
        length = Math.ceil(length);
      }
    } catch (e) {
      length = 0;
    }
    dialogData.leaveLength = length;
  };

  // 弹窗的显隐状态切换方法
  const handleToggleDialogShow = (show) => {
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单 在显示之前不要修改任何除弹窗显示之外的任何 dialogData 字段，否则无法重置表单
      ctx.$refs.operateForm.resetFields();
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitApplyLeave = () => {
    // 提交前 校验表单
    ctx.$refs.operateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const leaveInfo = toRaw(dialogData);
        leaveInfo.leaveDate.forEach((item, i) => {
          leaveInfo.leaveDate[i] = utils.formatterDateTime(item);
        });
        const res = await ctx.$api.leaveOperate(leaveInfo);
        if (res === true) {
          // 关闭弹窗
          handleToggleDialogShow(false);
          // 重新加载表格
          getLeaveList();
          // 弹出提示
          ctx.$message.success('提交申请休假成功！');
        } else {
          ctx.$message.warning('提交申请休假失败');
        }
      }
    });
  };
  // 返回业务逻辑给 setup
  return {
    dialogData,
    dialogDataRules,
    calculateLeaveLength,
    handleToggleDialogShow,
    handleSubmitApplyLeave,
  };
};

export default {
  name: 'ApplyLeaveDialog',
  props: {
    getLeaveList: {
      required: true,
      type: Function,
    },
    leaveTypeList: {
      required: true,
      type: Array,
    },
  },
  setup(props) {
    const { ctx } = getCurrentInstance();
    return {
      ...useApplyLeaveEffect(ctx, props.getLeaveList),
    };
  },
};
</script>
