<template>
  <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
    <el-form
      :model="dialogData"
      :rules="dialogDataRules"
      ref="userOperateForm"
      label-position="right"
      label-width="6em"
    >
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="dialogData.userName"
          :disabled="dialogData.action === 'edit'"
          placeholder="请输入用户名称"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="userEmail">
        <el-input
          v-model="dialogData.userEmail"
          :disabled="dialogData.action === 'edit'"
          placeholder="请输入用户邮箱"
          autocomplete="off"
        >
          <template #append>@manager.com</template>
        </el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input
          v-model="dialogData.mobile"
          placeholder="请输入用户手机号"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <el-form-item label="岗位名称" prop="job">
        <el-input
          v-model="dialogData.job"
          placeholder="请输入用户岗位名称"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <el-form-item label="在职状态" prop="state">
        <el-select v-model="dialogData.state" placeholder="请选择用户在职状态">
          <el-option label="试用期" :value="1"></el-option>
          <el-option label="在职" :value="2"></el-option>
          <el-option label="离职" :value="3"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="系统角色" prop="roleList">
        <el-select
          v-model="dialogData.roleList"
          placeholder="请选择用户系统角色"
          style="width: 100%"
          multiple
        >
          <el-option
            v-for="role in roleList"
            :key="role._id"
            :label="role.roleName"
            :value="role._id"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="所属部门" prop="deptId">
        <el-cascader
          v-model="dialogData.deptId"
          :options="deptList"
          :props="{
            label: 'deptName',
            value: '_id',
            checkStrictly: true,
            expandTrigger: 'hover',
          }"
          placeholder="请选择用户所属部门"
          style="width: 100%"
          clearable
        ></el-cascader>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleToggleShowUserDialog(false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmitUserOperate"
        >确 定</el-button
      >
    </template>
  </el-dialog>
</template>

<script>
import {
  getCurrentInstance, reactive, ref, toRaw, onMounted,
} from 'vue';

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getUserList 重新加载页面表格数据的方法
 * @description 新增、编辑用户数据的业务逻辑（弹窗）
 */
const useUserOperateEffect = (ctx, getUserList) => {
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    userId: '',
    userName: '',
    userEmail: '',
    mobile: '',
    job: '',
    state: 1,
    roleList: [],
    deptId: [],
    // 下面是弹窗的属性数据
    action: 'add', // add: 新增, edit: 编辑
    title: '新增用户',
    showDialog: false, // true 展示, false 隐藏
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    userName: { trigger: 'blur', required: true, message: '请输入用户名称' },
    userEmail: { trigger: 'blur', required: true, message: '请输入用户邮箱' },
    mobile: { trigger: 'blur', pattern: /1[3-9]\d{9}/, message: '无效手机号' },
    deptId: { trigger: 'blur', required: true, message: '请选择用户所属部门' },
  };
  // 弹窗的显隐状态切换方法
  const handleToggleShowUserDialog = (show, action, userInfo) => {
    // action 必须为新增或编辑，才能显示表单
    if (action === 'add' || action === 'edit') {
      dialogData.action = action;
      dialogData.title = `${action === 'add' ? '新增' : '编辑'}用户`;
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单
      ctx.$refs.userOperateForm.resetFields();
      if (show && action === 'edit') {
        // 如果是打开编辑，重新填充默认值
        dialogData.userId = userInfo.userId;
        dialogData.userName = userInfo.userName;
        dialogData.userEmail = userInfo.userEmail.split('@')[0];
        dialogData.mobile = userInfo.mobile;
        dialogData.job = userInfo.job;
        dialogData.state = userInfo.state;
        dialogData.roleList = userInfo.roleList;
        dialogData.deptId = userInfo.deptId;
      }
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitUserOperate = () => {
    // 提交前 校验表单
    ctx.$refs.userOperateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const data = toRaw(dialogData);
        data.userEmail += '@manager.com';
        const res = await ctx.$api.userOperate(data);
        if (res) {
          // 关闭弹窗
          handleToggleShowUserDialog(false);
          // 重新加载表格
          getUserList();
          // 弹出提示
          ctx.$message.success(`${dialogData.title}成功！`);
        } else {
          ctx.$message.warning(`${dialogData.title}失败！`);
        }
      }
    });
  };
  // 系统角色列表与部门列表的数据与加载方法。 TODO: 应该是一个系统级而非页面级方法，后续可能移到 HOME ，通过 vuex 交换
  const roleList = ref([]);
  const deptList = ref([]);
  const getRoleList = async () => {
    const list = await ctx.$api.getRoleList();
    if (list.length) {
      roleList.value = list;
    }
  };
  const getDeptList = async () => {
    const list = await ctx.$api.getDeptList();
    if (list.length) {
      deptList.value = list;
    }
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getRoleList();
    getDeptList();
  });

  // 返回业务逻辑给 setup
  return {
    dialogData,
    dialogDataRules,
    roleList,
    deptList,
    handleToggleShowUserDialog,
    handleSubmitUserOperate,
  };
};

export default {
  name: 'UserOperateDialog',
  props: {
    getUserList: {
      required: true,
      type: Function,
    },
  },
  setup(props) {
    const { ctx } = getCurrentInstance();
    return {
      ...useUserOperateEffect(ctx, props.getUserList),
    };
  },
};
</script>
