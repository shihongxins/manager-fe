<template>
  <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
    <el-form
      :model="dialogData"
      :rules="dialogDataRules"
      ref="operateForm"
      label-position="right"
      label-width="7em"
    >
      <el-form-item label="上级部门" prop="parentId">
        <el-cascader
          v-model="dialogData.parentId"
          :options="deptList"
          :props="{
            label: 'deptName',
            value: '_id',
            checkStrictly: true,
            expandTrigger: 'hover',
          }"
          placeholder="请选择用户所属部门"
          clearable
        ></el-cascader>
        <span>留空，则默认创建一级部门</span>
      </el-form-item>
      <el-form-item label="部门名称" prop="deptName">
        <el-input
          v-model="dialogData.deptName"
          placeholder="请输入部门名称"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <el-form-item label="部门负责人" prop="userInfo">
        <el-select v-model="dialogData.userInfo" filterable placeholder="请选择部门负责人" value-key="_id">
          <el-option
            v-for="user in userList"
            :key="user._id"
            :label="user.userName"
            :value="user"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="负责人邮箱" v-if="dialogData.userInfo">
        <el-input
          v-model="dialogData.userInfo.userEmail"
          placeholder="请输入部门名称"
          autocomplete="off"
          disabled
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleToggleDialogShow(false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmitDeptOperate"
        >确 定</el-button
      >
    </template>
  </el-dialog>
</template>

<script>
import {
  getCurrentInstance, reactive, toRaw, ref,
} from 'vue';

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getDeptList 重新加载页面表格数据的方法
 * @description 新增、编辑部门数据的业务逻辑（弹窗）
 */
const useDeptOperateEffect = (ctx, getDeptList) => {
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    parentId: [],
    _id: '',
    deptName: '',
    userInfo: null,
    // 下面是弹窗的属性数据
    action: 'add', // add: 新增, edit: 编辑
    title: '新增部门',
    showDialog: false, // true 展示, false 隐藏
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    deptName: { trigger: 'blur', required: true, message: '请输入部门名称' },
    userInfo: { trigger: 'blur', required: true, message: '请选择部门负责人' },
  };
  const userList = ref([]);
  // 弹窗的显隐状态切换方法
  const handleToggleDialogShow = (show, action, deptInfo) => {
    // action 必须为新增或编辑，才能显示表单
    if (action === 'add' || action === 'edit') {
      dialogData.action = action;
      if (action === 'edit') {
        dialogData.title = '编辑部门';
      } else if (action === 'add') {
        if (deptInfo) {
          dialogData.title = '添加子部门';
        } else {
          dialogData.title = '新增部门';
        }
      }
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单
      ctx.$refs.operateForm.resetFields();
      // 加载用户列表
      ctx.$api.getUserList().then((data) => {
        const { list } = data;
        if (list && list.length) {
          userList.value = list;
        }
      });
      if (deptInfo !== undefined) {
        // 如果是添加部门，那么父级部门为 当前部门的父级 加上 当前部门
        if (action === 'add') {
          dialogData.parentId = [...deptInfo.parentId, deptInfo._id].filter(
            (item) => item,
          );
          dialogData._id = '';
        }
        // 如果是编辑部门，那么父级部门不用修改，还需填入其他信息
        if (action === 'edit') {
          dialogData._id = deptInfo._id;
          dialogData.parentId = deptInfo.parentId.filter((item) => item);
          dialogData.deptName = deptInfo.deptName;
          dialogData.userInfo = deptInfo.userInfo;
        }
      }
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitDeptOperate = () => {
    // 提交前 校验表单
    ctx.$refs.operateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const deptInfo = toRaw(dialogData);
        const res = await ctx.$api.deptOperate(deptInfo);
        if (res) {
          // 关闭弹窗
          handleToggleDialogShow(false);
          // 重新加载表格
          getDeptList();
          // 弹出提示
          ctx.$message.success(
            `${dialogData.title} -> [${deptInfo.deptName}] 成功！`,
          );
        } else {
          ctx.$message.warning(
            `${dialogData.title} -> [${deptInfo.deptName}] 失败！`,
          );
        }
      }
    });
  };
  // 返回业务逻辑给 setup
  return {
    dialogData,
    dialogDataRules,
    userList,
    handleToggleDialogShow,
    handleSubmitDeptOperate,
  };
};

export default {
  name: 'DeptOperateDialog',
  props: {
    getDeptList: {
      required: true,
      type: Function,
    },
    deptList: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const { ctx } = getCurrentInstance();
    return {
      ...useDeptOperateEffect(ctx, props.getDeptList),
    };
  },
};
</script>
